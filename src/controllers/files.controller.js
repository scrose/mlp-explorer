/*!
 * MLP.API.Controllers.Files
 * File: files.controller.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import stream from 'stream';
import fs from 'fs';
import sharp from 'sharp';
import util from 'util';
import path from 'path';
import { Transform, Writable, Duplex } from 'stream';
import * as config from '../../config.js'

/**
 * Export controller constructor.
 *
 * @src public
 */

async function run(inStream, resizer, outStream) {
    await pipeline(inStream, resizer, outStream)
        .then(_ => {
            console.log('Pipeline succeeded');
            res.message(`Uploaded items ${item.label}.`, 'success');
            res.status(200).json(res.locals);
        })
        .catch(err => {
            return next(err)
        });
}

/**
 * Export controller constructor.
 *
 * @src public
 */

// generate controller constructor
export default function Uploader() {

    /**
     * Initialize the controller.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.init = async (req, res, next) => {

        next();
    };


    /**
     * Select image files for upload.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.browse = async (req, res, next) => {

        console.log('Browse Image files');
    };

    /**
     * Upload image files.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.upload = async (req, res, next) => {

        if (!req.files) return next();

        // get files
        let files = req.body.files;
        // retrieve MLP library folder
        const outputDir = process.env.LIBRARY_DIR;
        console.log('Files to upload:', files);

        try {


                await pipeline(inStream, resizer, outStream)
                    .then(_ => {
                        console.log('Pipeline succeeded');
                        res.message(`Uploaded items ${item.label}.`, 'success');
                        res.status(200).json(res.locals);
                    })
                    .catch(err => {
                        return next(err)
                    });

            let inStream, outStream;

            files.map(f => {

            })

            // input stream
            let inStream = fs.createReadStream(files[0]);

            // if client cancels the upload: forward upstream as an error.
            req.on('aborted', function() {
                inStream.emit('error', new Error('Upload aborted.'));
            });

            // output stream
            let outStream = fs.createWriteStream(
                path.join(outputDir, 'output.jpg'), { flags: "w" });

            // on error of output file being saved
            outStream.on('error', function() {
                console.error("Error");
            });

            // on success of output file being saved
            outStream.on('close', function() {
                console.log("Successfully saved file");
            });

            const pipeline = util.promisify(stream.pipeline);

            // Read image data from readableStream, resize and
            // emit an 'info' event with calculated dimensions
            // and finally write image data to writableStream
            let resizer = sharp()
                .resize(300)
                .on('info', function(info) {
                    console.log('Image height is ' + info.height);
                });


        }
        catch (err) {
            next(err)
        }
    }
}


// Create a new transform stream class that can validate files.
class FileValidator extends Transform {
    constructor(options) {
        super(options.streamOptions);

        this.maxFileSize = options.maxFileSize;
        this.totalBytesInBuffer = 0;
    }

    _transform (chunk, encoding, callback) {
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

    _flush (done) {
        done();
    }
}
