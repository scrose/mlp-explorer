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

import stream from 'stream';
import Busboy from 'busboy';
import fs from 'fs';
import sharp from 'sharp';
import util from 'util';
import path from 'path';
import pool from './db.services.js';
import { Transform, PassThrough, Writable, Duplex } from 'stream';
import { imageSizes } from '../../config.js';
import { genUUID } from '../lib/data.utils.js';
import queries from '../queries/index.queries.js';

/**
 * Async file uploader.
 *
 * @public
 * @param req
 * @param res
 * @param next
 * @param metadata
 * @return {Promise} result
 */

export const asyncUpload = async (req, res, next, metadata) => {

    // pass request headers to Busboy
    // - module for parsing incoming HTML form data
    const busboy = new Busboy({ headers: req.headers });
    let bulkData = {};

    req.on('close', cleanup);

    // initialize busboy
    busboy
        .on('field', onField.bind(null, bulkData))
        .on('file', onFile.bind(null, metadata, bulkData))
        .on('error', onError)
        .on('finish', onFinish)

    // pipe HTTP request to busboy
    return req.pipe(busboy);

    function onError(err) {
        cleanup();
        return next(err);
    }

    function onFinish(err) {

        cleanup();
        if (err) return next(err);

        // close connection
        res.writeHead(200, { Connection: 'close' });
        res.end();
    }

    function cleanup() {
        busboy.removeListener('field', onField);
        busboy.removeListener('file', onFile);
        busboy.removeListener('error', onError);
        busboy.removeListener('finish', onFinish);
    }
};

/**
 * Routes file uploader to server.
 *
 * @param metadata
 * @param bulkData
 * @param fieldname
 * @param fileStream
 * @param filename
 * @param encoding
 * @param mimetype
 * @src public
 */

const onFile = async (
    metadata,
    bulkData,
    fieldname,
    fileStream,
    filename,
    encoding,
    mimetype) => {

    try {
        // store basic file metadata for db records
        metadata.file.mimetype = mimetype;
        metadata.file.filename = filename;
        metadata.encoding = encoding;

        // if client cancels the upload: forward upstream as an error.
        // req.on('aborted', function() {
        //     fileStream.emit('error', new Error('Upload aborted.'));
        // });

        // track file size from data stream
        fileStream
            .on('data', function(data) {
                metadata.file.file_size += data.length;
            })
            .on('error', function(err) {
                    console.error(err);
                    throw err;
                });

        // select file handler by model type
        const fileHandlers = {
            historic_images: async () => {
                await uploadImage(fileStream, metadata, bulkData);
                insertCapture(metadata);
            },
            modern_images: async () => {
                await uploadImage(fileStream, metadata, bulkData);
                insertCapture(metadata);
            },
            supplemental_images: async ()=> {
                await uploadImage(fileStream, metadata, bulkData);
                insertMetadata(metadata);
            },
            default: async () => {
                const outPath = '/versions';
                await uploadFile(fileStream, outPath, metadata);
                insertMetadata(metadata, bulkData);
            }
        };

        // variable database callback to insert metadata records
        fileHandlers.hasOwnProperty(metadata.file.file_type)
            ? await fileHandlers[metadata.file.file_type]()
            : await fileHandlers.default();

    } catch (err) {
        console.error(err);
        throw err;
    }
}

/**
 * Uploads file to library.
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
 * Upload multiple image files.
 *
 * @return {Object} output file data
 * @src public
 * @param fileStream
 * @param metadata
 * @param bulkData
 */

export const uploadImage = async function (fileStream, metadata, bulkData) {

    try {

        // Define output paths for original and scaled images
        const outDir = process.env.UPLOAD_DIR;

        // generate unique filename ID token
        const imgToken = genUUID();

        // initialize image versions
        metadata.versions = {
            raw: {
                path: path.join(outDir, 'raw', metadata.file.filename),
                size: null,
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

        // set raw path in metadata
        metadata.file.fs_path = metadata.versions.raw.path;

        // upload original (raw) version
        await uploadFile(fileStream, metadata.versions.raw.path);

        // get metadata from reader for file
        let info = await sharp(metadata.versions.raw.path)
            .metadata()
            .catch(err => {throw err})

        // get image_state from bulkData
        const { image_state = 'raw' } = bulkData || {};
        // initialize image metadata
        metadata.model = {
            format: info.format,
            x_dim: info.width,
            y_dim: info.height,
            bit_depth: info.depth,
            channels: info.channels,
            density: info.density,
            space: info.space,
            image_state: image_state,
        };


        // create thumbnail scaled version:
        await sharp(metadata.versions.raw.path)
            .resize({
                width: metadata.versions.thumb.size.width,
            })
            .toFile(metadata.versions.thumb.path);


        // create medium scaled version:
        await sharp(metadata.versions.raw.path)
            .resize({
                width: metadata.versions.medium.size.width,
            })
            .toFile(metadata.versions.medium.path);

    } catch (err) {
        console.error(err);
        throw err;
    }
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
 * Upload multiple image files.
 *
 * @return {Object} output file data
 * @src public
 * @param inStream
 * @param outPath
 */

export const uploadFile = async function (inStream, outPath) {

    try {
        // create output stream
        const outStream = fs.createWriteStream(outPath)
            .on('error', (err) => {
                console.error(err);
                throw err;
            })
            .on('close', function() {
                console.log('Successfully saved file');
            });

        // create pipeline to pipe between streams and generators
        const pipeline = util.promisify(stream.pipeline);
        return await pipeline([inStream, outStream])

    } catch (err) {
        console.error(err);
        throw err;
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
        // console.log('Capture:', metadata);
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
 * @return {Promise} result
 */

export const checkRelation = async function(nodeType, fileType) {
    const { sql, data } = queries.files.checkRelation(nodeType, fileType);
    const isRelation = await pool.query(sql, data);
    return isRelation.rows.length > 0;
};

/**
 * Get all image state types.
 *
 * @public
 * @return {Promise} result
 */

export const getImageStates = async function() {
    const { sql, data } = queries.files.imageStates();
    const imageStates = await pool.query(sql, data);
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
 * @return {Promise} result
 */

export const select = async function(id) {
    let { sql, data } = queries.files.select(id);
    let file = await pool.query(sql, data);
    return file.rows[0];
};

/**
 * Get model data by file reference. Returns single node object.
 *
 * @public
 * @param {Object} file
 * @return {Promise} result
 */

export const selectByFile = async (file) => {
    const { file_type='' } = file || {};
    let { sql, data } = queries.defaults.selectByFile(file);
    return pool.query(sql, data)
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
 * @return {Promise} result
 */

export const selectByOwner = async (ownerID) => {

    // get first-level full data for each dependent node
    const { sql, data } = queries.files.selectByOwner(ownerID);
    const { rows=[] } = await pool.query(sql, data);
    let files = rows;

    // append metadata for each file record
    files = await Promise.all(files.map(async (file) => {
        file.data = await selectByFile(file);
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