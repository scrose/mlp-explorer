/*!
 * MLP.API.Services.Images
 * File: images.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as stream from 'stream';
import { mkdir, readFile, writeFile, stat } from 'fs/promises';
import fs from 'fs';
import {ExifTool} from 'exiftool-vendored';
import sharp from 'sharp';
import Jimp from 'jimp';
import path from 'path';
import { genUUID } from '../lib/data.utils.js';
import dcraw from 'dcraw';
import { sanitize } from '../lib/data.utils.js';
import Queue from 'bull';
import redis from 'redis';
import { insertFile, remove } from './files.services.js';
import * as util from "util";


/* Available image version sizes */

const imageSizes = {
    thumb: 150,
    medium: 900,
    full: 2100,
};

/**
 * Connect to Redis message broker
 * - allows files to be queued for transcoder
 * @private
 */

let queue = new Queue('transcode', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

// test Redis connection
const redisConnect = redis.createClient({
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

// handle Redis connection error
redisConnect.on('error', error => {
    console.log('ERROR initialising Redis connection', error.message);
});

// test Redis connection.
redisConnect.on('connect', async () => {
    console.log(
        `Connected to Redis: ${redisConnect.address}`,
    );
});

/**
 * Transcode image file.
 *
 * @public
 * @return {Promise} result
 * @param data
 * @param callback
 */

export const transcode = async (data, callback) => {

    const {
        src = '',
        filename = '',
        metadata = {},
        versions = {},
        owner = {},
        imageState = '',
        options = {},
    } = data || {};
    let isRAW = false;
    let copySrc = src;

    try {

        // read temporary image into buffer memory
        // record buffer size as file size
        //let buffer = await readFile(src);
        await stat(src).then(stats => {
            console.log(stats)
            metadata.file.file_size = stats.size;
        });

        //
        // // convert RAW image to tiff
        // // Reference: https://github.com/zfedoran/dcraw.js/
        // let bufferRaw = dcraw(buffer, {
        //     useEmbeddedColorMatrix: true,
        //     exportAsTiff: true,
        //     useExportMode: true,
        // });
        //
        // // create temporary file for upload (if format is supported)
        // if (bufferRaw) {
        //     const tmpName = Math.random().toString(16).substring(2) + '-' + filename;
        //     copySrc = path.join(process.env.TMP_DIR, path.basename(tmpName));
        //     await writeFile(copySrc, bufferRaw);
        //     isRAW = true;
        // }
        // delete buffer
        // buffer = null;
        // bufferRaw = null;

        // get image metadata
        await getImageInfo(copySrc, metadata, options, isRAW);

        // copy image versions to data storage
        await copyImageTo(src, versions.raw);
        await copyImageTo(copySrc, versions.medium);
        await copyImageTo(copySrc, versions.thumb);
        await copyImageTo(copySrc, versions.full);

        // add file record to database
        await insertFile(metadata, owner, imageState);

        // delete temporary files
        src === copySrc
            ? await remove(null, [src])
            : await remove(null, [src, copySrc])

        return {
            raw: isRAW,
            src: copySrc,
            metadata: metadata,
        };
    } catch (err) {
        callback(err);
    }
};
/**
 * Save transcoded raw image file and resampled versions.
 *
 * @public
 * @return {Promise} result
 * @param filename
 * @param metadata
 * @param owner
 * @param imageState
 * @param options
 */

export const saveImage = async (filename, metadata, owner, imageState, options) => {

    // generate unique filename ID token
    const imgToken = genUUID();

    // insert token into filename
    const tokenizedFilename = [
        filename.slice(0, filename.lastIndexOf('.')),
        imgToken,
        filename.slice(filename.lastIndexOf('.'))].join('');

    // create raw path directory (if does not exist)
    const rawPath = path.join(process.env.UPLOAD_DIR, owner.fs_path, imageState);
    await mkdir(rawPath, { recursive: true });

    const versions = {
        // create new filesystem path
        // - format: <UPLOAD_PATH>/<IMAGE_STATE>/<FILENAME>
        raw: {
            format: 'raw',
            path: path.join(rawPath, tokenizedFilename),
            size: null,
        },
        // resized versions
        thumb: {
            format: 'jpeg',
            path: path.join(process.env.LOWRES_PATH, `thumb_${imgToken}.jpeg`),
            size: imageSizes.thumb,
        },
        medium: {
            format: 'jpeg',
            path: path.join(process.env.LOWRES_PATH, `medium_${imgToken}.jpeg`),
            size: imageSizes.medium,
        },
        full: {
            format: 'jpeg',
            path: path.join(process.env.LOWRES_PATH, `${imgToken}.jpeg`),
            size: imageSizes.full,
        },
    };

    // update file metadata
    // - NOTE: ensure filesystem path does not include upload directory
    metadata.data.secure_token = imgToken;
    metadata.file.owner_type = owner.type;
    metadata.file.owner_id = owner.id;
    metadata.file.fs_path =  path.join(owner.fs_path, imageState, tokenizedFilename);

    // TODO: Remove this line (only for TESTING)
    metadata.data.channels = 3;

    // prepare metadata for transcoding
    const resData = {
        src: metadata.tmp,
        filename: filename,
        metadata: metadata,
        owner: owner,
        imageState: imageState,
        versions: versions,
        options: options,
    };

    // Queue image transcoding
    queue.add(resData);

    // return updated metadata
    return resData;
};


/**
 * Extract image file metadata.
 *
 * @src public
 * @param src
 * @param fileData
 * @param options
 * @param isRAW
 * @param onError
 */

export const getImageInfo = async (
    src,
    fileData,
    options,
    isRAW,
    onError = console.error,
) => {

    // extract exif metadata using ExifTool (vendored)
    const exiftool = new ExifTool({ taskTimeoutMillis: 5000 });
    const exifTags = await exiftool.read(src);

    const {
        FileType = '',
        MIMEType = '',
        ImageWidth = 0,
        ImageHeight = 0,
        BitsPerSample=' ',
        ColorSpaceData='',
        Model = '',
        ProfileDateTime = '',
        ExposureTime = '',
        Fnumber = '',
        ISO = '',
        FocalLength = '',
        GPSLatitude = '',
        GPSLongitude = '',
        GPSAltitude = '',
    } = exifTags || {};

    // copy EXIF metadata
    if (
        ProfileDateTime
        && (fileData.file.file_type === 'modern_images' || fileData.file.file_type === 'historic_images')
    ) {
        fileData.data.capture_datetime = ProfileDateTime.toDate();
    }
    // fileData.file.file_size = info.size;
    fileData.file.mimetype = MIMEType;
    fileData.data.format = isRAW ? 'raw' : FileType;
    fileData.data.x_dim = ImageWidth;
    fileData.data.y_dim = ImageHeight;
    fileData.data.channels = ColorSpaceData === 'RGB' ? 3 : 1;
    // fileData.data.density = info.density;
    // fileData.data.space = info.space;
    fileData.data.shutter_speed = sanitize(ExposureTime, 'float');
    fileData.data.f_stop = sanitize(Fnumber, 'float');
    fileData.data.iso = sanitize(ISO, 'integer');
    fileData.data.focal_length = sanitize(FocalLength, 'integer');
    fileData.data.lat = sanitize(GPSLatitude, 'float');
    fileData.data.lng = sanitize(GPSLongitude, 'float');
    fileData.data.elev = sanitize(GPSAltitude, 'float');

    // include camera model (if available)
    const camera = options.cameras
        .find(camera => camera.label === Model);
    if (camera) fileData.data.cameras_id = camera.value;

    await exiftool.end();

};

/**
 * Create file source URLs for resampled images from file data.
 *
 * @public
 * @param {String} type
 * @param {Object} data
 * @return {Promise} result
 */

export const getImageURL = (type = '', data = {}) => {

    const { secure_token = '' } = data || {};

    // ======================================================
    // DEVELOPMENT TEST
    // - check if using MEAT images or local ones
    // ======================================================
    // const rootURI = data.channels
    //     ? `${process.env.API_HOST}/uploads/`
    //     : `${process.env.DEV_API_HOST}/versions/`;

    const rootURI =`${process.env.API_HOST}/uploads/`;

    // ======================================================

    // generate resampled image URLs
    const imgSrc = (token) => {
        return Object.keys(imageSizes).reduce((o, key) => {
            o[key] = new URL(`${key !== 'full' ? key + '_' : ''}${token}.jpeg`, rootURI);
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
 * Copy image file on server. Applies file conversion if requested, otherwise
 * skips conversion on raw files. Images are resized (if requested).
 *
 * @return {Object} output file data
 * @src public
 * @param src
 * @param output
 * @param callback
 */

export const copyImageTo = async (src, output, callback) => {

    // Disable Sharp cache
    // sharp.cache(false);
    // sharp.concurrency(1);

    // Create pipeline for saving and resizing the image, converting to JPEG
    // and use pipe to read from bucket read stream

    // const image = new Jimp(src, function (err, image) {
    //     const w = image.bitmap.width; //  width of the image
    //     const h = image.bitmap.height; // height of the image
    //     console.log(Jimp)
    // });

    if (output.size) {
        await Jimp.read(src)
            .then(img => {
                return img
                        .resize(output.size, Jimp.AUTO)
                        .quality(80) // set JPEG quality
                        .write(output.path)
            });

        console.log(`Image ${src}: \n\t- resampled to ${output.size}px width \n\t- saved to ${output.path}.`);

    } else {
        const pipeline = util.promisify(stream.pipeline);

        async function run() {
            await pipeline(
                fs.createReadStream(src),
                output.format !== 'raw'
                    ? sharp().resize({ width: output.size }).jpeg({ quality: 80 })
                    : new stream.PassThrough(),
                fs.createWriteStream(output.path)
            );
        }

        await run().catch(console.error);
        console.log(`Raw image ${src} saved to ${output.path}.`)
    }

};