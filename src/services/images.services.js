/*!
 * MLP.API.Services.Images
 * File: images.services.js
* Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Image processing module.
 *
 * ---------
 * Revisions
 * - 29-07-2023   Refactored out Redis connection as separate queue service.
 */

'use strict';

import * as stream from 'stream';
import {mkdir} from 'fs/promises';
import fs from 'fs';
import {ExifTool} from 'exiftool-vendored';
import sharp from 'sharp';
import path from 'path';
import {genUUID, sanitize} from '../lib/data.utils.js';
import * as util from "util";
// import Jimp from 'jimp';
// import dcraw from 'dcraw';

/* Available image version sizes */

const imageSizes = {
    thumb: 150,
    medium: 900,
    full: 1500,
};


/**
 * Save processed raw image file and resampled versions.
 *
 * @public
 * @return {Promise} result
 * @param filename
 * @param metadata
 * @param owner
 * @param imageState
 * @param options
 * @param queue
 */

export const saveImage = async (filename, metadata, owner, imageState, options, queue) => {

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
            path: path.join(process.env.LOWRES_PATH, `full_${imgToken}.jpeg`),
            size: imageSizes.full,
        },
    };

    // update file metadata
    // - NOTE: ensure filesystem path does not include upload directory
    metadata.data.secure_token = imgToken;
    metadata.file.owner_type = owner.type;
    metadata.file.owner_id = owner.id;
    metadata.file.fs_path =  path.join(owner.fs_path, imageState, tokenizedFilename);

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
 */

export const getImageInfo = async (
    src,
    fileData,
    options,
    isRAW
) => {

    // extract exif metadata using ExifTool (vendored)
    const exiftool = new ExifTool({ taskTimeoutMillis: 5000 });
    const exifTags = await exiftool.read(src);

    const {
        FileType = '',
        MIMEType = '',
        ImageWidth = 0,
        ImageHeight = 0,
        BitDepth='',
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
    fileData.data.density = sanitize(BitDepth, 'integer');
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
    const rootURI =`${process.env.API_HOST}/uploads/`;

    // generate resampled image URLs
    const imgSrc = (token) => {
        return Object.keys(imageSizes).reduce((o, key) => {
            o[key] = new URL(`${key}_${token}.jpeg`, rootURI);
            return o;
        }, {});
    };

    // handle image source URLs
    // - images use scaled versions of raw files
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
 * Copy image files to library. Applies file conversion if requested, otherwise
 * skips conversion on raw files. Images are resized (if requested).
 *
 * @return {Object} output file data
 * @src public
 * @param src
 * @param output
 */

export const copyImageTo = async (src, output) => {

    // Disable Sharp cache
    sharp.cache(false);
    sharp.concurrency(1);

    // Create pipeline for saving and resizing the image, converting to JPEG
    // and use pipe to read from bucket read stream

    // const image = new Jimp(src, function (err, image) {
    //     const w = image.bitmap.width; //  width of the image
    //     const h = image.bitmap.height; // height of the image
    //     console.log(Jimp)
    // });

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

};

