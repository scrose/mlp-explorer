/*!
 * MLP.API.Services.Files
 * File: files.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import Busboy from 'busboy';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import pool from './db.services.js';
import { Readable, Transform } from 'stream';
import { imageSizes } from '../../app.config.js';
import { genUUID } from '../lib/data.utils.js';
import queries from '../queries/index.queries.js';
import os from 'os';

/**
 * Async busboy file and data importer.
 * Reference: https://github.com/m4nuC/async-busboy/blob/master/index.js
 *
 * @public
 * @param req
 * @param owner_id
 * @param owner_type
 * @return busboy uploader
 */

export const upload = (req, owner_id, owner_type) => {

    // pass request headers to Busboy
    // - module for parsing incoming HTML form data
    const busboy = new Busboy({ headers: req.headers });

    return new Promise((resolve, reject) => {
        // allow for multiple files
        const filePromises = [];
        let metadata = {
            files: {},
            data: {
                owner_id: owner_id,
            },
            owner: {
                id: owner_id,
                type: owner_type
            }
        };

        req.on('close', cleanup);

        busboy
            .on('field', onField.bind(null, metadata.data))
            .on('file', onFile.bind(null, filePromises, metadata))
            .on('error', onError)
            .on('end', onEnd)
            .on('finish', onEnd);

        busboy.on('partsLimit', function() {
            const err = new Error('Reach parts limit');
            err.code = 'Request_parts_limit';
            err.status = 413;
            onError(err);
        });

        busboy.on('filesLimit', () => {
            const err = new Error('Reach files limit');
            err.code = 'Request_files_limit';
            err.status = 413;
            onError(err);
        });

        busboy.on('fieldsLimit', () => {
            const err = new Error('Reach fields limit');
            err.code = 'Request_fields_limit';
            err.status = 413;
            onError(err);
        });

        req.pipe(busboy);

        function onError(err) {
            console.error(err)
            cleanup();
            return reject(err);
        }

        function onEnd(err) {
            if (err) {
                return reject(err);
            }
            Promise.all(filePromises)
                .then(() => {
                    cleanup();
                    resolve(metadata);
                })
                .catch(reject);
        }

        function cleanup() {
            busboy.removeListener('field', onField);
            busboy.removeListener('file', onFile);
            busboy.removeListener('close', cleanup);
            busboy.removeListener('end', cleanup);
            busboy.removeListener('error', onEnd);
            busboy.removeListener('partsLimit', onEnd);
            busboy.removeListener('filesLimit', onEnd);
            busboy.removeListener('fieldsLimit', onEnd);
            busboy.removeListener('finish', onEnd);
        }
    });
}

/**
 * Handle file data.
 *
 * @src public
 * @param filePromises
 * @param metadata
 * @param fieldname
 * @param file
 * @param filename
 * @param encoding
 * @param mimetype
 */

const onFile = (filePromises, metadata, fieldname, file, filename, encoding, mimetype) => {

    if (!filename) {
        throw new Error('invalidRequest');
    }

    // create temporary file for upload
    const tmpName = file.tmpName = Math.random().toString(16).substring(2) + '-' + filename;
    const saveTo = path.join(os.tmpdir(), path.basename(tmpName));

    // initialize file metadata
    let fileData = {};

    // Parse any stringified arrays
    const [file_type, index] = fieldname.indexOf('[') > -1
        ? extractFieldData(fieldname)
        : [fieldname, null];

    fileData.file = {
        file_type: file_type,
        mimetype: mimetype,
        filename: filename,
        file_size: 0,
        fs_path: null,
        filename_tmp: saveTo
    };
    fileData.encoding = encoding;
    fileData.tmp = saveTo;

    // create writable stream for temp file
    const writeStream = fs.createWriteStream(saveTo);

    const filePromise = new Promise((resolve, reject) => writeStream
        .on('open', () => file
            .pipe(writeStream)
            .on('error', reject)
            .on('finish', () => {
                // get file size
                const stats = fs.statSync(saveTo)
                fileData.file.file_size = stats.size;

                // attach to metadata
                if (index)
                    metadata.files[index] = fileData;
                else
                    metadata.files[0] = fileData;

                resolve(metadata);
            })
        )
        .on('error', (err) => {
            file
                .resume()
                .on('error', reject);
            reject(err);
        })
    );
    filePromises.push(filePromise);
}

/**
 * Handles fields (non-file data) in form data.
 *
 * @src public
 * @param fields
 * @param name
 * @param val
 * @param fieldnameTruncated
 * @param valTruncated
 */

function onField(fields, name, val, fieldnameTruncated, valTruncated) {

    if (name.indexOf('[') > -1) {

        // Parse any stringified arrays
        const [key, index] = extractFieldData(name);

        if (fields.hasOwnProperty(key)) {
            fields[key][index] = val;
        }
        else {
            fields[key] = {[index]: val};
        }
    }
    else {
        fields[name] = val;
    }

}

/**
 * Callback process for file uploads.
 *
 * @src public
 * @param index
 * @param metadata
 */

export const saveFile = function (index, metadata) {

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
        }

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
        }

        // file handlers router indexed by model type
        const fileHandlers = {
            historic_images: captureHandler,
            modern_images: captureHandler,
            supplemental_images: ()=> {
                filePromises.push(
                    copyImage(fileData.tmp, metadata.versions.raw),
                    getImageInfo(fileData.tmp, fileData.data),
                    copyImage(fileData.tmp, metadata.versions.medium, 'jpg'),
                    copyImage(fileData.tmp, metadata.versions.thumb, 'jpg'),
                );
            },
            default: () => {
                return insertMetadata(metadata);
            }
        };

        console.log('Type', index, metadata)

        // route database callback after file upload
        fileHandlers.hasOwnProperty(fileData.file.file_type)
            ? fileHandlers[fileData.file.file_type]()
            : fileHandlers.default();

        return Promise.all(filePromises);
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

const copyImage = function (inPath, output, format) {

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
                    .on('error', reject)
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
                    force: true
                })
                .pipe(writeStream);
            return new Promise((resolve, reject) =>
                writeStream
                    .on('finish', resolve)
                    .on('error', reject)
            );
        },
        default: () => {
            // default handler streams temporary file to new destination
            return fs.copyFile(inPath, output.path, (err)=>{
                if (err) throw err;
            });
        }
    }

    // handle requested format (default is raw image)
    return handleFormats.hasOwnProperty(format)
        ? handleFormats[format]()
        : handleFormats.default();

}

/**
 * Extract image metadata.
 *
 * @return {Object} output file data
 * @src public
 * @param imgPath
 * @param file
 * TODO: Improve exif extraction
 */

const getImageInfo = function (imgPath, file) {
    const image = sharp(imgPath);
    return image
        .metadata()
        .then(function(info) {
            if (info.hasOwnProperty('xmp'))
                console.log(info)
            file.format = info.format;
            file.x_dim = info.width;
            file.y_dim = info.height;
            file.bit_depth = info.depth;
            file.channels = info.channels;
            file.density = info.density;
            file.space = info.space;
        })
        .catch(console.error);
}


/**
 * Insert file metadata record into database
 * - called when files have completed upload to server
 * - bulkData: common metadata for all uploaded files
 *
 * @return {Object} output file data
 * @src public
 * @param metadata
 * @param bulkData
 */

const insertMetadata = (metadata, bulkData) => {
    try {
        // get bulk metadata
        const { id = '', image_state = '' } = bulkData || {};

        // for each file, insert new metadata record in db
        metadata.map(md => {

            // create model instance of owner
            const item = new Model(md.data);
            item.setValue('image_state', image_state);

            // set owner and file metadata
            item.owner = id;
            item.file = md.file;

            // insert file metadata record
            services.insert(item);
        });

    } catch (err) {
        return null;
    }
}

/**
 *
 * Extract a hierarchy array from a stringified formData single input.
 *
 *
 * i.e. topLevel[sub] => [topLevel, sub]
 *
 * @param  {String} string: Stringify representation of a formData Object
 * @return {Array}
 *
 */
const extractFieldData = (string) => {
    const arr = string.split('[');
    const first = arr.shift();
    const res = arr.map( v => v.split(']')[0] );
    res.unshift(first);
    return res;
};

/**
 * Reconciles formatted data with already formatted data
 *
 * @param  {Object} obj extractedObject
 * @param  {Object} target the field object
 * @return {Object} reconciled fields
 *
 */
const reconcile = (obj, target, value) => {
    const key = Object.keys(obj)[0];
    const val = obj[key];

    // The reconciliation works even with array has
    // Object.keys will yield the array indexes
    // see https://jsbin.com/hulekomopo/1/
    // Since array are in form of [ , , valu3] [value1, value2]
    // the final array will be: [value1, value2, value3] has expected
    if (target.hasOwnProperty(key)) {
        return reconcile(val, target[key]);
    } else {
        return target[key] = val;
    }

};

/**
 * Create a new transform stream class that can validate files.
 *
 * @param {Request} req
 * @param {String} inFilepath
 * @param {String} outFilepath
 * @param {Object} downsample
 * @src public
 */

class FileValidator extends Transform {
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

/**
 * Download file stream.
 *
 * @src public
 * @param fileName
 * @param contentType
 * @param contentStream
 * @param data
 */

export const download = async (fileName, contentType, contentStream, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fileStream = fs.createWriteStream(fileName);
            const contentStream = fs.createReadStream(data);
            contentStream.pipe(data);

            contentStream.on('error', reject);
            fileStream.on('error', reject);
            fileStream.on('finish', () => {
                try {
                    resolve();
                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

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
        }
        else {
            this.push(null);
        }
    }
}


/**
 * Check if node and file types are relatable.
 *
 * @public
 * @param {String} nodeType
 * @param {String} fileType
 * @param client
 * @return {Promise} result
 */

export const checkRelation = async function(nodeType, fileType, client=pool) {
    const { sql, data } = queries.files.checkRelation(nodeType, fileType);
    const isRelation = await client.query(sql, data);
    return isRelation.rows.length > 0;
};

/**
 * Get if file type by node owner.
 *
 * @public
 * @param {String} nodeType
 * @param client
 * @return {Promise} result
 */

export const getFileTypesByOwner = async function(nodeType, client=pool) {
    const { sql, data } = queries.files.getRelationsByNodeType(nodeType);
    const fileTypes = await client.query(sql, data);
    return fileTypes.rows.reduce((o, row) => {
        o.push(row.dependent_type);
        return o;
    }, []);
};

/**
 * Get all image state types.
 *
 * @public
 * @return {Promise} result
 */

export const getImageStates = async function(client=pool) {
    const { sql, data } = queries.files.imageStates();
    const imageStates = await client.query(sql, data);
    return imageStates.rows;
};

/**
 * Create file source URLs from file data.
 *
 * @public
 * @param {String} type
 * @param {Object} data
 * @return {Promise} result
 */

const genSrc = (type='', data={}) => {

    const { secure_token='' } = data || {};

    // generate image source URLs
    const imgSrc = (token) => {
        return Object.keys(imageSizes).reduce((o, key) => {
            // const rootURI = `${process.env.API_HOST}:${process.env.API_PORT}/resources/versions/`;
            const rootURI = 'http://meat.uvic.ca/uploads/versions/'
            o[key] = new URL(`${key}_${token}.jpeg`, rootURI);
            return o;
        }, {});
    }

    // handle image source URLs differently than metadata files
    // - images use scaled versions of raw files
    // - metadata uses PDF downloads
    const fileHandlers = {
        historic_images: () => {return imgSrc(secure_token)},
        modern_images: () => {return imgSrc(secure_token)},
        supplemental_images: () => {return imgSrc(secure_token)},
        metadata_files: () => {return null}
    }

    // Handle file types
    return fileHandlers.hasOwnProperty(type) ? fileHandlers[type]() : null;
};


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
 * Get model data by file reference. Returns single node object.
 *
 * @public
 * @param {Object} file
 * @param client
 * @return {Promise} result
 */

export const selectByFile = async (file, client=pool) => {
    const { file_type='' } = file || {};
    let { sql, data } = queries.defaults.selectByFile(file);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows[0] : {};
        });
};

/**
 * Get files for given owner.
 *
 * @public
 * @param {number} id
 * @param client
 * @return {Promise} result
 */

export const selectByOwner = async (id, client=pool) => {

    // get all dependent files for requested owner
    const { sql, data } = queries.files.selectByOwner(id);
    const { rows=[] } = await client.query(sql, data);

    // append full data for each dependent node
    let files = await Promise.all(
        rows.map(
            async(file) => {
                const {file_type=''} = file || {};
                const fileMetadata = await selectByFile(file, client)
                return {
                    file: file,
                    metadata: fileMetadata,
                    url: genSrc(file_type, fileMetadata)
                }
            })
        );

    // group files by type
    return files.reduce(
        async(o, f) => {
            const { file={}} = f || {};
            const { file_type='files'} = file || {};

            // create file group
            if (!o.hasOwnProperty(file_type)) {
                o[file_type] = [];
            }

            // add file to group
            o[file_type].push(f);
            return o;
        }, {})
};
