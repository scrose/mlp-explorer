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
import { Transform, PassThrough, Writable, Duplex } from 'stream';
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
 * @return busboy uploader
 */

export const upload = (req) => {

    // pass request headers to Busboy
    // - module for parsing incoming HTML form data
    const busboy = new Busboy({ headers: req.headers });

    return new Promise((resolve, reject) => {
        const filePromises = [];
        let metadata = {};

        req.on('close', cleanup);

        busboy
            .on('field', onField.bind(null, metadata))
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
            console.log('End!!')
            Promise.all(filePromises)
                .then((file) => {
                    cleanup();
                    resolve({ metadata, file });
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
    metadata.file = {
            mimetype: mimetype,
            filename: filename,
            file_size: 0,
            fs_path: null
        };
    metadata.encoding = encoding;
    metadata.outpath = saveTo;

    const writeStream = fs.createWriteStream(saveTo);

    const filePromise = new Promise((resolve, reject) => writeStream
        .on('open', () => file
            .pipe(writeStream)
            .on('error', reject)
            .on('finish', () => {
                // get file size
                const stats = fs.statSync(saveTo)
                metadata.file.file_size = stats.size;

                // return readable stream of file
                const readStream = fs.createReadStream(saveTo);
                readStream.filename = filename;
                readStream.transferEncoding = readStream.encoding = encoding;
                readStream.mimeType = readStream.mime = mimetype;
                resolve(readStream);
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
    if (fields.hasOwnProperty(name)) {
        if (Array.isArray(fields[name])) {
            fields[name].push(val);
        } else {
            fields[name] = [fields[name], val];
        }
    } else {
        fields[name] = val;
    }
}

/**
 * Callback process for file uploads.
 *
 * @src public
 * @param fileType
 * @param file
 * @param metadata
 */

export const processFile = function (fileType, file, metadata) {

        // file promises
        let filePromises = [];

        // Define output paths for original and scaled images
        const outDir = process.env.UPLOAD_DIR;

        // generate unique filename ID token
        const imgToken = genUUID();

        // initialize image versions
        metadata.versions = {
            raw: {
                path: path.join(outDir, 'raw', metadata.file.filename),
                size: {width: null},
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

        // file handlers indexed by model type
        const fileHandlers = {
            historic_images: () => {
                filePromises.push(
                    copyImage(metadata.outpath, metadata.versions.raw),
                    getImageInfo(metadata),
                    copyImage(metadata.outpath, metadata.versions.medium),
                    copyImage(metadata.outpath, metadata.versions.thumb),
                );
            },
            modern_images: () => {
                filePromises.push(
                    copyImage(metadata.outpath, metadata.versions.raw),
                    getImageInfo(metadata),
                    copyImage(metadata.outpath, metadata.versions.medium),
                    copyImage(metadata.outpath, metadata.versions.thumb),
                );
            },
            supplemental_images: ()=> {
                filePromises.push(
                    copyImage(metadata.outpath, metadata.versions.raw),
                    getImageInfo(metadata),
                    copyImage(metadata.outpath, metadata.versions.medium),
                    copyImage(metadata.outpath, metadata.versions.thumb),
                );
            },
            default: () => {
                return insertMetadata(file, metadata);
            }
        };

        // route database callback after file upload
        fileHandlers.hasOwnProperty(fileType)
            ? fileHandlers[fileType]()
            : fileHandlers.default();

        return Promise.all(filePromises);
};

/**
 * Upload image to server.
 *
 * @return {Object} output file data
 * @src public
 * @param inPath
 * @param output
 */

const copyImage = function (inPath, output) {

    // get sharp pipeline
    const pipeline = sharp(inPath);

    // Create write stream for uploading image
    const writeStream = fs.createWriteStream(output.path);

    // resize (if provided)
    pipeline
        .resize(output.size.width)
        .pipe(writeStream);

    return new Promise((resolve, reject) =>
        writeStream
            .on('finish', resolve)
            .on('error', reject));
}

/**
 * Extract image metadata.
 *
 * @return {Object} output file data
 * @src public
 * @param imgData
 */

const getImageInfo = function (imgData) {
    const image = sharp(imgData.outpath);
    return image
        .metadata()
        .then(function(info) {
            imgData.image = {
                format: info.format,
                x_dim: info.width,
                y_dim: info.height,
                bit_depth: info.depth,
                channels: info.channels,
                density: info.density,
                space: info.space
            }
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
            const item = new Model(md.model);
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
 * Insert capture record into database
 * - called when files have completed upload to server
 * - bulkData: common metadata for all uploaded files
 *
 * @return {Object} output file data
 * @src public
 * @param metadata
 */

const insertCapture = (metadata) => {
    try {
        console.log('Capture:', metadata);
        return

        // for each file, insert new metadata record in db
        metadata.map(md => {

            // create model instance of owner
            const item = new Model(md.model);
            item.setValue('image_state', image_state);

            // set owner and file metadata
            item.owner = id;
            item.file = md.file;

            // insert file metadata record
            services.insert(item);
        });

        // return res.status(200).json(
        //     prepare({
        //         view: 'upload',
        //         message: { msg: 'Upload completed!', type: 'success' },
        //     }));
    } catch (err) {
        return null;
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
            o[key] = new URL(`${key}_${token}.jpeg`, process.env.LIBRARY_DIR);
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
            const fileData = res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows[0] : {};
            fileData.url = genSrc(file_type, fileData);
            return fileData;
        });
};

/**
 * Get files for given owner.
 *
 * @public
 * @param {integer} ownerID
 * @param client
 * @return {Promise} result
 */

export const selectByOwner = async (ownerID, client=pool) => {

    // get first-level full data for each dependent node
    const { sql, data } = queries.files.selectByOwner(ownerID);
    const { rows=[] } = await client.query(sql, data);
    let files = rows;

    // append metadata for each file record
    files = await Promise.all(files.map(async (file) => {
        file.data = await selectByFile(file, client);
        return file;
    }));

    // return nodes
    return files;

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