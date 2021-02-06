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
import fs from 'fs';
import sharp from 'sharp';
import util from 'util';
import path from 'path';
import pool from './db.services.js';
import { Transform, PassThrough, Writable, Duplex } from 'stream';
import { getFilename } from '../lib/file.utils.js';
import { imageSizes } from '../../config.js';
import { genUUID } from '../lib/data.utils.js';
import queries from '../queries/index.queries.js';


/**
 * Upload multiple image files.
 *
 * @param {Request} req
 * @param {Array} fileList
 * @return {Object} output file data
 * @src public
 */

export const uploadImages = async function (req, fileList) {

    if (!fileList) return null;

    const outDir = process.env.LIBRARY_DIR;
    const inFiles = fileList;
    let outFiles = [];
    console.log('Files to upload:', fileList);

    try {
        const uploadFiles = async () => {
            return Promise.all(
                inFiles.map(inFilepath => {
                    // upload original file to library
                    const rawFilepath = path.join(outDir, 'raw', getFilename(inFilepath));
                    this.uploadFile(req, inFilepath, rawFilepath);

                    // generate unique filename token
                    const imgToken = genUUID();

                    // copy thumbnail-sized version to library
                    const thumbFilepath = path.join(outDir, 'versions', `thumb_${imgToken}.jpg`);
                    this.uploadFile(req, inFilepath, thumbFilepath, imageSizes.thumb);

                    // copy medium-sized version to library
                    const medFilepath = path.join(outDir, 'versions', `medium_${imgToken}.jpg`);
                    this.uploadFile(req, inFilepath, medFilepath, imageSizes.medium);

                    // record generated file paths
                    outFiles.push({
                        raw: rawFilepath,
                        thumb: thumbFilepath,
                        medium: medFilepath,
                    });

                }));
        };
        await uploadFiles()
            .then(_ => {
                console.log(`Uploaded items ${outFiles}.`);
            })
            .catch(err => {throw err;});
        return outFiles;
    } catch (err) {throw err;}
};


/**
 * Uploads file to library.
 *
 * @param {Request} req
 * @param {String} inFilepath
 * @param {String} outFilepath
 * @param {Object} downsample
 * @src public
 */

export const uploadFile = async function(req, inFilepath, outFilepath, downsample = null) {

    // input stream
    let inStream = fs.createReadStream(inFilepath);

    // if client cancels the upload: forward upstream as an error.
    req.on('aborted', function() {
        inStream.emit('error', new Error('Upload aborted.'));
    });

    // output stream
    let outStream = fs.createWriteStream(outFilepath, { flags: 'w' });

    // on error of output file being saved
    outStream.on('error', function() {
        console.error('Error');
    });

    // on success of output file being saved
    outStream.on('close', function() {
        console.log('Successfully saved file');
    });

    // Read image data from readableStream, resize using Sharp and
    // emit an 'info' event with calculated dimensions. Finally write
    // image data to writableStream
    let transformer = downsample
        ? sharp()
            .resize(downsample.width)
            .on('info', function(info) {
                console.log('Image height is ' + info.height);
            })
        : new PassThrough();

    // create pipeline to pipe between streams and generators
    const pipeline = util.promisify(stream.pipeline);
    return await pipeline(inStream, transformer, outStream);
}

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
    let { sql, data } = queries.defaults.selectByFile(file);
    return pool.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows[0] : null;
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

    files.map(file => {
    console.log(file)
        file.url = path.join(process.env.LIBRARY_DIR, file.id);
        return file;
    })

    // append metadata for each file record
    // files = await Promise.all(files.map(async (file) => {
    //     file.data = await selectByFile(file);
    //     return file;
    // }));

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