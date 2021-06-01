/*!
 * MLP.API.Services.Files
 * File: files.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import path from 'path';
import fs from 'fs';
import { copyFile, unlink, mkdir } from 'fs/promises';
import sharp from 'sharp';
import pool from './db.services.js';
import queries from '../queries/index.queries.js';
import { genUUID, sanitize } from '../lib/data.utils.js';
import * as cserve from './construct.services.js';
import * as metaserve from '../services/metadata.services.js';
import * as nserve from '../services/nodes.services.js';
import ModelServices from './model.services.js';
import { allowedMIME } from '../lib/file.utils.js';

/* Available image version sizes */

const imageSizes = {
    thumb: 150,
    medium: 900,
    full: 2100
}

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
    const { type='', secure_token=''} = metadata || {};
    const { file_type = '', filename='', owner_id='' } = file || {};
    const owner = await nserve.select(owner_id, client) || {};

    // include alternate extracted filename (omit the security token)
    return {
        file: file,
        owner: owner,
        label: await metaserve.getFileLabel(file, client),
        filename: (filename || '').replace(`_${secure_token}`, ''),
        metadata: metadata,
        metadata_type: await metaserve.selectByName('metadata_file_types', type),
        url: getFileURL(file_type, metadata),
        status: await metaserve.getStatus(owner, metadata, client)
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
                const { type='', secure_token=''} = fileMetadata || {};
                return {
                    file: file,
                    label: await metaserve.getFileLabel(file),
                    filename: (filename || '').replace(`_${secure_token}`, ''),
                    metadata: fileMetadata,
                    metadata_type: await metaserve.selectByName('metadata_file_types', type),
                    url: getFileURL(file_type, fileMetadata),
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
 * - import data structure:
 *  {
 *      file:{file metadata},
 *      data: {image metadata},
 *      owner: {owner data}
 *  }
 *
 * @public
 * @param {Object} importData
 * @param {String} model
 * @param {Object} fileOwner
 * @return {Promise} result
 */

export const insert = async (importData, model, fileOwner=null) => {

    const captureTypes = ['historic_captures', 'modern_captures'];
    const {files={}, data={}, owner={}} = importData || {};
    const metadata = data;

    // filter image states from imported metadata
    // - for multiple images, image state is indexed by file key
    console.log(metadata.image_state)
    const imageState = metadata.image_state;

    // reject null parameters
    if (
        Object.keys(files).length === 0
        || Object.keys(owner).length === 0
        || Object.keys(metadata).length === 0
    ) {
        return null;
    }

    // init transaction result
    let res;


    // initialize immediate file owners for given file type
    const initFileOwners = {

        // file is a capture image
        captures: async () => {

            // initialize capture database services
            const CaptureModel = await cserve.create(model);
            const mserve = new ModelServices(new CaptureModel());

            // remove image state from capture data (not in model)
            delete metadata.image_state;

            // insert new capture owner for image file
            const capture = new CaptureModel(metadata);
            const captureData = await mserve.insert(capture);

            // get capture node metadata
            const {nodes_id=''} = captureData || {};
            const {fs_path=''} = await nserve.select(nodes_id) || {};

            return {
                id: nodes_id,
                type: model,
                fs_path: fs_path
            };
        },

        // owner already exists
        default: async () => {
            return {
                id: owner.id,
                type: owner.type,
                fs_path: owner.fs_path
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
            : captureTypes.includes(model)
                ? await initFileOwners.captures()
                : await initFileOwners.default();

        // saves attached files and inserts metadata record for each
        res = await Promise
            .all(Object.keys(files)
                .map(async (key) => {

                    // upload file and save to image data store
                    await saveFile(key, importData, fileOwner, imageState);

                    // get imported metadata
                    const { data={}, file={} } = files[key] || {};
                    const {file_type=''} = file || {};

                    // update file owner data
                    data.owner_id = fileOwner.id;
                    file.owner_id = fileOwner.id;
                    file.owner_type = fileOwner.type;

                    // include image state for capture images
                    if (imageState) {
                        data.image_state = typeof imageState === 'string'
                            ? imageState
                            : imageState[key];
                    }

                    // initialize file model services
                    // - create new file model instance from file-specific data
                    const FileModel = await cserve.create(file_type);
                    const fileItem = new FileModel(data);

                    // include model-specific data if NOT handling capture file
                    if (!captureTypes.includes(model)) {
                        fileItem.setData(metadata);
                    }

                    // create file node instance
                    // - use file model instance with extracted file data
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

    // remove file node record
    let { sql, data } = queries.files.remove(file);
    let response = await client.query(sql, data) || [];

    // delete attached files
    // - assumes file paths are to regular files.
    // - requires removal of static slug from file path
    //   as set in Express static-serve
    await Promise.all(
        filepaths.map( async (filePath) => {
            fs.stat(filePath, async (err, stat) => {
                if(err == null) {
                    return await unlink(filePath);
                } else if (err.code === 'ENOENT') {
                    // file does not exist (ignore)
                    console.warn(err);
                    return null;
                } else {
                    throw err;
                }
            });
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
 * @param res
 * @param src
 */

export const download = async (res, src) => {
    return new Promise(async (resolve, reject) => {
        try {
            const readStream = fs.createReadStream(src);
            readStream.pipe(res);

            readStream.on('error', (err) => {
                console.log('Error in read stream...');
            });
            res.on('error', (err) => {
                console.log('Error in write stream...');
            });

        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Create file source URLs for resampled images from file data.
 *
 * @public
 * @param {String} type
 * @param {Object} data
 * @return {Promise} result
 */

export const getFileURL = (type = '', data = {}) => {

    const { secure_token = '' } = data || {};

    // ======================================================
    // DEVELOPMENT TEST
    // TODO: TO BE REMOVED IN PRODUCTION
    // - check if using MEAT images or local ones
    // ======================================================
    const rootURI = data.channels
        ? `${process.env.CLIENT_HOST}/uploads/`
        : `${process.env.DEV_API_HOST}/versions/`;
    // ======================================================

    // generate resampled image URLs
    const imgSrc = (token) => {
        return Object.keys(imageSizes).reduce((o, key) => {
            o[key] = new URL(`${key !== 'full' ? key : ''}_${token}.jpeg`, rootURI);
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
 * @param srcPath
 * @param output
 * @param format
 */

export const copyFileTo = function(srcPath, output, format) {

    // handle conversion to requested formats
    const handleFormats = {
        tif: () => {
            // get sharp pipeline + write stream for uploading image
            // - fails if the dest path exists
            const pipeline = sharp(srcPath);
            const writeStream = fs.createWriteStream(output.path, {flags: 'wx'});
            pipeline
                .resize(output.size)
                .tif()
                .pipe(writeStream);
            return new Promise((resolve, reject) =>
                writeStream
                    .on('finish', resolve)
                    .on('error', reject),
            );
        },
        jpeg: () => {
            // get sharp pipeline + write stream for uploading image
            // - fails if the dest path exists
            const pipeline = sharp(srcPath);
            const writeStream = fs.createWriteStream(output.path, {flags: 'wx'});
            pipeline
                .resize(output.size)
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
            // - The copy operation will fail if dest already exists.
            return copyFile(srcPath, output.path, fs.constants.COPYFILE_EXCL);
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
 * @param owner
 * @param imageStateData
 */

export const saveFile = async (index, metadata, owner, imageStateData=null) => {

    // define file upload promises
    let filePromises = [];

    // get file data object
    let fileData = metadata.files[index];
    fileData.data = {};

    console.log(fileData)

    // generate unique filename ID token
    const imgToken = genUUID();

    // get file type
    const { file_type='', mimetype='', filename='' } = fileData.file || {};

    // for multiple files, image state is indexed by the file index
    const imageState = !imageStateData || typeof imageStateData === 'string'
        ? imageStateData
        : imageStateData[index];

    // reject null file data
    if (!file_type || !mimetype || !filename ) throw new Error();

    // initialize image versions
    const _handleImages = async (dir) => {

        // insert token into filename
        const tokenizedFilename = [
            filename.slice(0, filename.lastIndexOf('.')),
            imgToken,
            filename.slice(filename.lastIndexOf('.'))].join('');

        // create raw path directory (if does not exist)
        const rawPath = path.join(process.env.UPLOAD_DIR, owner.fs_path, dir);
        await mkdir(rawPath, {recursive: true});

        metadata.versions = {
            // create new filesystem path
            // - format: <UPLOAD_PATH>/<IMAGE_STATE>/<FILENAME>
            raw: {
                // path: path.join(rawPath, tokenizedFilename),
                path: path.join(rawPath, tokenizedFilename),
                size: null,
            },
            // resized versions
            thumb: {
                path: path.join(process.env.LOWRES_PATH, `thumb_${imgToken}.jpeg`),
                size: imageSizes.thumb,
            },
            medium: {
                path: path.join(process.env.LOWRES_PATH, `medium_${imgToken}.jpeg`),
                size: imageSizes.medium,
            },
            full: {
                path: path.join(process.env.LOWRES_PATH, `${imgToken}.jpeg`),
                size: imageSizes.full,
            },
        };

        // update file metadata
        fileData.data.secure_token = imgToken;
        fileData.file.owner_type = metadata.owner.type;
        fileData.file.owner_id = metadata.owner.id;
        fileData.file.fs_path = metadata.versions.raw.path;

        // copy images to data storage
        filePromises.push(
            copyFileTo(fileData.tmp, metadata.versions.raw),
            getImageInfo(fileData.tmp, fileData.data),
            copyFileTo(fileData.tmp, metadata.versions.medium, 'jpeg'),
            copyFileTo(fileData.tmp, metadata.versions.thumb, 'jpeg'),
        );
    };

    // handle file upload procedure based on file type
    const _fileHandlers = {
        historic_images: async () => {
            // upload and save image data
            await _handleImages(imageState || 'no_state');
            // handle image state value
            // - copy to file metadata and remove from metadata model
            fileData.data.image_state = imageState;
            delete metadata.data.image_state;
        },
        modern_images: async () => {
            // upload and save image data
            await _handleImages(imageState || 'no_state');
            // handle image state value
            // - copy to file metadata and remove from metadata model
            fileData.data.image_state = imageState;
            delete metadata.data.image_state;
        },
        supplemental_images: async () => {
            // upload and save image data
            await _handleImages('supplemental');
        },
        default: async () => {

            if (!allowedMIME(mimetype)) throw new Error('invalidMIMEType');

            const saveType = metadata.data.hasOwnProperty('type') ? metadata.data.type : 'unknown';
            // create raw path directory (if does not exist)
            const uploadPath = path.join(process.env.UPLOAD_DIR, owner.fs_path, saveType);
            await mkdir(uploadPath, {recursive: true});
            const filePath = path.join(uploadPath, filename);

            // update file metadata
            fileData.file.owner_type = metadata.owner.type;
            fileData.file.owner_id = metadata.owner.id;
            fileData.file.fs_path = filePath;

            // copy file to data storage
            filePromises.push(
                copyFileTo(fileData.tmp, {path: filePath}),
            );
        },
    };
    _fileHandlers.hasOwnProperty(file_type)
        ? await _fileHandlers[file_type]()
        : await _fileHandlers.default();

    return Promise.all(filePromises);
};
