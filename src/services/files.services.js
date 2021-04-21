/*!
 * MLP.API.Services.Files
 * File: files.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import path from 'path';
import fs from 'fs';
import { unlink } from 'fs/promises';
import sharp from 'sharp';
import { Readable, Transform } from 'stream';
import pool from './db.services.js';
import queries from '../queries/index.queries.js';
import { imageSizes } from '../../app.config.js';
import { genUUID, sanitize } from '../lib/data.utils.js';
import { insertMetadata } from './import.services.js';
import * as cserve from './construct.services.js';
import * as metaserve from '../services/metadata.services.js';
import ModelServices from './model.services.js';
import * as http from 'http';

/**
 * Get file record by ID. NOTE: returns single object.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const select = async function(id, client=pool) {
    let { sql, data } = queries.files.select(id);
    let file = await client.query(sql, data);
    return file.rows[0];
};

/**
 * Get file data by file ID. Returns single node object.
 *
 * @public
 * @param {String} id
 * @param client
 * @return {Promise} result
 */

export const get = async (id, client = pool) => {

    if (!id) return null;

    // get requested file
    const file = await select(sanitize(id, 'integer'), client);

    // check that file exists
    if (!file) return null;

    // get associated file metadata
    const metadata = await selectByFile(file, client) || {};
    const {secure_token=''} = metadata || {};
    const { file_type = '', filename='' } = file || {};

    // include alternate extracted filename (omit the security token)
    return {
        file: file,
        label: await metaserve.getFileLabel(file),
        filename: (filename || '').replace(`_${secure_token}`, ''),
        metadata: metadata,
        url: getResizedImgSrc(file_type, metadata),
    };

};

/**
 * Get files for given owner.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const selectByOwner = async (id, client = pool) => {

    // get all dependent files for requested owner
    const { sql, data } = queries.files.selectByOwner(id);
    const { rows = [] } = await client.query(sql, data);

    // append full data for each dependent node
    let files = await Promise.all(
        rows.map(
            async (file) => {
                const { file_type = '', filename='' } = file || {};
                const fileMetadata = await selectByFile(file, client);
                const {secure_token=''} = fileMetadata || {};
                return {
                    file: file,
                    label: await metaserve.getFileLabel(file),
                    filename: (filename || '').replace(`_${secure_token}`, ''),
                    metadata: fileMetadata,
                    url: getResizedImgSrc(file_type, fileMetadata),
                };
            }),
    );

    // group files by type
    return files.reduce((o, f) => {
        const { file = {} } = f || {};
        const { file_type = 'files' } = file || {};

        // create file group
        if (!o.hasOwnProperty(file_type)) {
            o[file_type] = [];
        }

        // add file to group
        o[file_type].push(f);
        return o;
    }, {});
};


/**
 * Get if file type by node owner.
 *
 * @public
 * @param {String} nodeType
 * @param client
 * @return {Promise} result
 */

export const getFileTypesByOwner = async function(nodeType, client = pool) {
    const { sql, data } = queries.files.getRelationsByNodeType(nodeType);
    const fileTypes = await client.query(sql, data);
    return fileTypes.rows.reduce((o, row) => {
        o.push(row.dependent_type);
        return o;
    }, []);
};

/**
 * Get if owner node type by file type.
 *
 * @public
 * @param {String} fileType
 * @param client
 * @return {Promise} result
 */

export const getOwnerByFileType = async function(fileType, client = pool) {
    const { sql, data } = queries.files.getOwnerTypeByFileType(fileType);
    const ownerTypes = await client.query(sql, data);
    return ownerTypes.rows.reduce((o, row) => {
        o.push(row.owner_type);
        return o;
    }, []);
};


/**
 * Insert file metadata.
 * - structure:
 *  {
 *      file:{file metadata},
 *      data: {image metadata}
 *  }
 *
 * @public
 * @param {Object} importData
 * @param {String} model
 * @param {Object} fileOwner
 * @return {Promise} result
 */

export const insert = async (importData, model, fileOwner=null) => {

    const captures = ['historic_captures', 'modern_captures'];
    const {files={}, data={}, owner={}} = importData || {};

    // filter image states from imported metadata
    const imageState = data.image_state;

    // reject null parameters
    if (
        Object.keys(files).length === 0
        || Object.keys(owner).length === 0
        || Object.keys(data).length === 0
    ) {
        return null;
    }

    // transaction result
    let res;

    // initialize immediate file owners
    const initFileOwners = {

        // file is a capture image
        captures: async () => {

            // initialize capture database services
            const CaptureModel = await cserve.create(model);
            const mserve = new ModelServices(new CaptureModel());

            // remove image state from capture data (not in model)
            delete data.image_state;

            // insert new capture owner for image file
            const capture = new CaptureModel(data);
            const captureData = await mserve.insert(capture);

            // update file data with capture owner
            const {nodes_id=''} = captureData || {};
            return {
                id: nodes_id,
                type: model
            };
        },

        // owner already exists (non-capture file)
        default: async () => {
            return {
                id: owner.id,
                type: owner.type
            };
        }
    };

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {

        // start import transaction
        await client.query('BEGIN');

        // use existing or create file owner instance
        fileOwner = fileOwner
            ? fileOwner
            : captures.includes(model)
                ? await initFileOwners.captures()
                : await initFileOwners.default();

        // save files and insert metadata record for each
        res = await Promise.all(Object.keys(files).map(async (key) => {

            // upload file
            await saveFile(key, importData);

            // get imported metadata
            const {data={}, file={}} = files[key] || {};
            const {file_type=''} = file || {};

            // update file owner data
            data.image_state = typeof imageState === 'string' ? imageState : imageState[key];
            data.owner_id = fileOwner.id;
            file.owner_id = fileOwner.id;
            file.owner_type = fileOwner.type;

            // initialize file model services
            const FileModel = await cserve.create(file_type);

            // create and insert new file instance
            const fileItem = new FileModel(data);
            let fileNode = await cserve.createFile(fileItem, file);
            const stmtFileNode = queries.files.insert(fileNode);
            let fileRes = await client.query(stmtFileNode.sql, stmtFileNode.data);

            // update file metadata files_id with created file ID, defined image state
            const {id=''} = fileRes.hasOwnProperty('rows') && fileRes.rows.length > 0
                ? fileRes.rows[0] || {}
                : {};
            fileItem.id = id;

            // insert file metadata as new record
            // NOTE: need to define different query than current services object model
            const stmtFileData = queries.defaults.insert(fileItem)(fileItem);
            let modelRes = await client.query(stmtFileData.sql, stmtFileData.data);

            // return confirmation data
            return modelRes.hasOwnProperty('rows') && modelRes.rows.length > 0
                ? {
                    file: fileRes.rows[0],
                    metadata: modelRes.rows[0]
                  }
                : null;

        }));

        await client.query('COMMIT');

        // return confirmation data
        return res

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

};

/**
 * Update file metadata in existing record.
 *
 * @public
 * @param item
 * @param client
 * @return {Promise} result
 */

export const update = async(item, client=pool) => {

    let { sql, data } = queries.files.update(item);
    let response = await client.query(sql, data);

    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
};

/**
 * Delete file(s) and metadata for given file entry.
 *
 * @param {Object} file
 * @param filepaths
 * @param client
 * @return Response data
 * @public
 */

export const remove = async(file, filepaths, client=pool) => {

    let error = null;
    let { sql, data } = queries.files.remove(file);
    let response = await client.query(sql, data);

    // delete attached files
    // - assumes file paths are to regular files.
    await Promise.all(
        filepaths.map( async(path) => {
            await unlink(path);
        })
    );

    // response data
    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
}

/**
 * Download file stream.
 *
 * @src public
 * @param src
 * @param dst
 */

export const download = async (src, dst) => {
    return new Promise(async (resolve, reject) => {
        try {
            const file = fs.createWriteStream(dst);
            const contentStream = fs.createReadStream(src);
            contentStream.pipe(file);
            contentStream.on('error', reject);
            file.on('error', reject);
            file.on('finish', () => {
                file.close();
                try {
                    resolve();
                } catch (err) {
                    // Delete the file async. (But we don't check the result)
                    fs.unlink(dst, console.error);
                    console.warn(err);
                    reject(err);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Get image file URL for raw image.
 *
 * @public
 * @param {String} type
 * @param {Object} data
 * @return {Promise} result
 */

export const getRawImgSrc = (type = '', data = {}) => {

    // generate raw image source URL
    const imgSrc = () => {
        console.log(data)
    };

    // handle image source URLs differently than metadata files
    // - images use scaled versions of raw files
    // - metadata uses PDF downloads
    const fileHandlers = {
        historic_images: () => {
            return imgSrc();
        },
        modern_images: () => {
            return imgSrc();
        },
        supplemental_images: () => {
            return imgSrc();
        },
        metadata_files: () => {
            return null;
        },
    };

    // Handle file types
    return fileHandlers.hasOwnProperty(type) ? fileHandlers[type]() : null;
}

/**
 * Create file source URLs for resampled images from file data.
 *
 * @public
 * @param {String} type
 * @param {Object} data
 * @return {Promise} result
 */

export const getResizedImgSrc = (type = '', data = {}) => {

    const { secure_token = '' } = data || {};

    // generate image source URLs
    const imgSrc = (token) => {
        // include resampled image URLs
        return Object.keys(imageSizes).reduce((o, key) => {
            const rootURI = `${process.env.API_HOST}:${process.env.API_PORT}/resources/versions/`;
            // const rootURI = 'http://meat.uvic.ca/uploads/versions/';
            o[key] = new URL(`${key}_${token}.jpeg`, rootURI);
            return o;
        }, {});
    };

    // handle image source URLs differently than metadata files
    // - images use scaled versions of raw files
    // - metadata uses PDF downloads
    const fileHandlers = {
        historic_images: () => {
            return imgSrc(secure_token);
        },
        modern_images: () => {
            return imgSrc(secure_token);
        },
        supplemental_images: () => {
            return imgSrc(secure_token);
        },
        metadata_files: () => {
            return null;
        },
    };

    // Handle file types
    return fileHandlers.hasOwnProperty(type) ? fileHandlers[type]() : null;
};

/**
 * Get model data by file reference. Returns single node object.
 *
 * @public
 * @param {Object} file
 * @param client
 * @return {Promise} result
 */

export const selectByFile = async (file, client = pool) => {
    let { sql, data } = queries.defaults.selectByFile(file);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows[0] : {};
        });
};

/**
 * Extract image metadata.
 *
 * @return {Object} output file data
 * @src public
 * @param imgPath
 * @param file
 * TODO: Improve exif extraction
 */

export const getImageInfo = function(imgPath, file) {
    const image = sharp(imgPath);
    return image
        .metadata()
        .then(function(info) {
            if (info.hasOwnProperty('xmp'))
                file.format = info.format;
            file.x_dim = info.width;
            file.y_dim = info.height;
            file.bit_depth = info.depth;
            file.channels = info.channels;
            file.density = info.density;
            file.space = info.space;
        })
        .catch(console.error);
};
/**
 * Upload image to server. Applies file conversion if requested, otherwise
 * skips conversion on raw files. Images are resized (if requested).
 *
 * @return {Object} output file data
 * @src public
 * @param inPath
 * @param output
 * @param format
 */

export const copyImage = function(inPath, output, format) {

    // handle conversion to requested formats
    const handleFormats = {
        tif: () => {
            // get sharp pipeline + write stream for uploading image
            const pipeline = sharp(inPath);
            const writeStream = fs.createWriteStream(output.path);
            pipeline
                .resize(output.size.width)
                .tif()
                .pipe(writeStream);
            return new Promise((resolve, reject) =>
                writeStream
                    .on('finish', resolve)
                    .on('error', reject),
            );
        },
        jpg: () => {
            // get sharp pipeline + write stream for uploading image
            const pipeline = sharp(inPath);
            const writeStream = fs.createWriteStream(output.path);
            pipeline
                .resize(output.size.width)
                .jpeg({
                    quality: 100,
                    force: true,
                })
                .pipe(writeStream);
            return new Promise((resolve, reject) =>
                writeStream
                    .on('finish', resolve)
                    .on('error', reject),
            );
        },
        default: () => {
            // default handler streams temporary file to new destination
            return fs.copyFile(inPath, output.path, (err) => {
                if (err) throw err;
            });
        },
    };

    // handle requested format (default is raw image)
    return handleFormats.hasOwnProperty(format)
        ? handleFormats[format]()
        : handleFormats.default();

};

/**
 * Callback process for file uploads.
 *
 * @src public
 * @param index
 * @param metadata
 */

export const saveFile = function(index, metadata) {

    // get file data object
    let fileData = metadata.files[index];
    fileData.data = {};

    // file promises
    let filePromises = [];

    // Define output paths for original (raw) and scaled images
    const outDir = process.env.UPLOAD_DIR;

    // generate unique filename ID token
    const imgToken = genUUID();

    // initialize image versions
    const createVersions = () => {
        return {
            raw: {
                path: path.join(outDir, 'raw', fileData.file.filename),
                size: { width: null },
            },
            thumb: {
                path: path.join(outDir, 'versions', `thumb_${imgToken}.jpg`),
                size: imageSizes.thumb,
            },
            medium: {
                path: path.join(outDir, 'versions', `medium_${imgToken}.jpg`),
                size: imageSizes.medium,
            },
        };
    };

    // update metadata
    fileData.data.secure_token = imgToken;
    // metadata.data.fn_photo_reference = path.parse(file.filename).name;

    // process capture images
    const captureHandler = () => {

        // create image versions
        metadata.versions = createVersions();

        // update file metadata
        fileData.file.owner_type = metadata.owner.type;
        fileData.file.owner_id = metadata.owner.id;
        fileData.file.fs_path = metadata.versions.raw.path;

        // get image state from model data (if exists)
        // then delete it from the model properties
        if (metadata.data.hasOwnProperty('image_state')) {
            fileData.data.image_state = metadata.data.image_state[index];
            delete metadata.data.image_state;
        }

        // create scaled versions of image
        filePromises.push(
            copyImage(fileData.tmp, metadata.versions.raw),
            getImageInfo(fileData.tmp, fileData.data),
            copyImage(fileData.tmp, metadata.versions.medium, 'jpg'),
            copyImage(fileData.tmp, metadata.versions.thumb, 'jpg'),
        );
    };

    // file handlers router indexed by model type
    const fileHandlers = {
        historic_images: captureHandler,
        modern_images: captureHandler,
        supplemental_images: () => {
            filePromises.push(
                copyImage(fileData.tmp, metadata.versions.raw),
                getImageInfo(fileData.tmp, fileData.data),
                copyImage(fileData.tmp, metadata.versions.medium, 'jpg'),
                copyImage(fileData.tmp, metadata.versions.thumb, 'jpg'),
            );
        },
        default: () => {
            return insertMetadata(metadata);
        },
    };

    // route database callback after file upload
    fileHandlers.hasOwnProperty(fileData.file.file_type)
        ? fileHandlers[fileData.file.file_type]()
        : fileHandlers.default();

    return Promise.all(filePromises);
};

/**
 * Create readable stream for non-image data.
 *
 * @public
 * @return {Promise} result
 */

export class ArrayStream extends Readable {

    constructor(data) {
        super();
        this._data = data;
        this.sent = false;
    }

    _read() {
        if (!this.sent) {
            const buf = Buffer.from(this._data, 'utf-8');
            this.push(buf);
            this.sent = true;
        } else {
            this.push(null);
        }
    }
}

/**
 * Create a new transform stream class that can validate files.
 *
 * @param {Request} req
 * @param {String} inFilepath
 * @param {String} outFilepath
 * @param {Object} downsample
 * @src public
 */

export class FileValidator extends Transform {
    constructor(options) {
        super(options.streamOptions);

        this.maxFileSize = options.maxFileSize;
        this.totalBytesInBuffer = 0;
    }

    _transform(chunk, encoding, callback) {
        this.totalBytesInBuffer += chunk.length;

        // Look to see if the file size is too large.
        if (this.totalBytesInBuffer > this.maxFileSize) {
            const err = new Error(`The file size exceeded the limit of ${this.maxFileSize} bytes`);
            err.code = 'MAXFILESIZEEXCEEDED';
            callback(err);
            return;
        }

        this.push(chunk);

        callback(null);
    }

    _flush(done) {
        done();
    }
}