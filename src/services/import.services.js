/*!
 * MLP.API.Services.Import
 * File: import.services.js
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
import path from 'path';
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

export const receive = (req, owner_id, owner_type) => {

    // pass request headers to Busboy
    // - module for parsing incoming HTML form data
    const busboy = new Busboy({ headers: req.headers });

    return new Promise((resolve, reject) => {
        // allow for multiple files
        const filePromises = [];
        let metadata = {
            files: {},
            data: {},
            owner: {
                id: owner_id,
                type: owner_type
            }
        };

        // close request pipeline
        req.on('close', cleanup);

        // initialize busboy
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
            console.error(err);
            cleanup();
            return reject(err);
        }

        function onEnd(err) {
            if (err) {
                console.error(err);
                return reject(err);
            }
            Promise.all(filePromises)
                .then(() => {
                    cleanup();

                    // include requested owner ID if not null
                    if (owner_id) metadata.data.owner_id = owner_id;

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

export const onFile = (filePromises, metadata, fieldname, file, filename, encoding, mimetype) => {

    if (!filename) {
        throw new Error('Invalid request');
    }

    // create temporary file for upload
    const tmpName = file.tmpName = Math.random().toString(16).substring(2) + '-' + filename;
    const saveTo = path.join(os.tmpdir(), path.basename(tmpName));

    // initialize file metadata
    let fileData = {};

    // Parse any stringified arrays
    // - extracts file type from multiple images
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

export function onField(fields, name, val, fieldnameTruncated, valTruncated) {

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
 * Insert file metadata record into database
 * - called when files have completed upload to server
 * - bulkData: common metadata for all uploaded files
 *
 * @return {Object} output file data
 * @src public
 * @param metadata
 * @param bulkData
 */

export const insertMetadata = (metadata, bulkData) => {
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

export const extractFieldData = (string) => {
    const arr = string.split('[');
    const first = arr.shift();
    const res = arr.map( v => v.split(']')[0] );
    res.unshift(first);
    return res;
};