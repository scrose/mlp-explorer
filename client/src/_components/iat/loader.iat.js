/*!
 * MLP.Client.IAT.Load
 * File: loader.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * Adapted from IAT web application
 * MIT Licensed
 */

import * as UTIF from 'utif';
import { download, getMIME } from '../../_services/api.services.client';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { getError } from '../../_services/schema.services.client';

/**
 * Prepares image file data for use in canvas layers.
 *
 * @param properties
 * @param callback
 * @private
 */

export const loadImageData = async (properties, callback) => {

    /**
     * Load file data into canvas layers (indexed by MIME type).
     */

    const loadFile = (fileData, mimeType, url = null) => {
        const fileHandlers = {
            'image/tiff': () => {
                loadTIFF(fileData)
                    .then(tiff => {
                        // convert data to Image Data object
                        const { width = 0, height = 0, data = [] } = tiff || {};

                        // update local panel properties
                        properties.original_dims = { w: width, h: height };
                        properties.image_dims = { w: width, h: height };
                        properties.source_dims = { x: 0, y: 0, w: width, h: height };
                        properties.render_dims = { x: 0, y: 0, w: width, h: height };
                        callback({status: 'load', data: toImageData(data, width, height), props:  properties});
                    })
                    .catch((err) => {callback({status: 'empty', error: err})});
            },
            'default': () => {
                const src = fileData ? URL.createObjectURL(fileData) : url;
                // load image source
                const img = new Image();
                img.onerror = (err) => {callback({status: 'empty', error: err})};
                img.onload = function() {
                    URL.revokeObjectURL(src); // free memory held by Object URL

                    // update local panel properties
                    properties.original_dims = { w: img.width, h: img.height };
                    properties.image_dims = { w: img.width, h: img.height };
                    properties.source_dims = { x: 0, y: 0, w: img.width, h: img.height };
                    properties.render_dims = { x: 0, y: 0, w: img.width, h: img.height };
                    callback({status: 'load', data: img, props: properties});
                }
                img.src = src;
            }
        };
        return fileHandlers.hasOwnProperty(mimeType)
            ? fileHandlers[mimeType]()
            : fileHandlers.default();
    };

    /**
     * Image data loaders
     */

    const loaders = {

        /**
         * Handle image data downloaded from API
         *  - download image file from MLP library
         */

        api: () => {

            // get file format and generate node route
            const mimeType = getMIME(properties.filename);
            const route = createNodeRoute(
                properties.file_type, 'download', properties.files_id);

            // download image data to canvas
            download(route, mimeType)
                .then(res => {
                    if (res.error) return callback({error: res.error});
                    loadFile(res.data, mimeType);
                })
                .catch(err => {callback({status: 'empty', error: err})});
        },

        /**
         * Handle image data downloaded from file
         *  - loads TIFF format image data
         */

        file: () => {
            const mimeType = getMIME(properties.filename);
            loadFile(properties.file, mimeType);
        },

        /**
         * Handle image data loaded from URL
         * - loads image data from url
         */

        url: () => {
            const mimeType = getMIME(properties.filename);
            loadFile(null, mimeType, properties.url);
        }
    };

    // Filter load method by input file data
    const { files_id = '', file = null, url = '' } = properties || [];

    // Load file from API
    if (files_id) return loaders.api();
    // Load from uploaded file
    if (file) return loaders.file();
    // Load file from URL
    if (url) return loaders.url();
    // invalid load request
    return callback({
        status: 'cancel',
        error: {msg: 'Image load cancelled.', type:'info'}
    })
}

/**
 * Loads TIFF format image file.
 *
 * @param file
 * @return {Promise<unknown>}
 */

export const loadTIFF = (file) => {

    if (!file) return null;

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onerror = (err) => {
            console.error(err);
            reader.abort();
            reject({ msg: getError('streamError', 'canvas'), type: 'error' });
        };
        reader.onload = (e) => {
            let buffer = e.target.result;

            // validate TIFF data
            const imgType = getImageType(buffer);
            if (imgType !== 'tiff-le' && imgType !== 'tiff-be') {
                reject({
                    msg: `Problem parsing TIFF data stream: Image is of ${imgType.toUpperCase()} format.`,
                    type: 'error',
                });
                return;
            }

            // decode to Uint8Array of the image in RGBA format, 8 bits per channel
            const ifds = UTIF.decode(buffer);
            UTIF.decodeImage(buffer, ifds[0]);
            let rgba = UTIF.toRGBA8(ifds[0]);  // Uint8Array with RGBA pixels
            resolve({
                data: rgba,
                width: ifds[0].width,
                height: ifds[0].height,
            });
        };
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Converts data buffer array to image data.
 *
 * @param data
 * @param w
 * @param h
 */

export const toImageData = (data, w, h) => {
    return new ImageData(new Uint8ClampedArray(data), w, h);
};

/**
 * Determines image format based on file signature.
 * Bitmap format .bmp 42 4d BM
 * FITS format .fits 53 49 4d 50 4c 45 SIMPL
 * GIF format .gif 47 49 46 38 GIF
 * Graphics Kernel System .gks 47 4b 53 4d GKS
 * IRIS rgb format .rgb 01 da
 * ITC (CMU WM) format .itc f1 00 40 bb
 * JPEG File Interchange Format .jpg ff d8 ff e0
 * NIFF (Navy TIFF) .nif 49 49 4e 31 IIN
 * PM format .pm 56 49 45 57 VIE
 * PNG format .png 89 50 4e 47 .PN
 * Postscript format .[e]ps 25 21 %
 * Sun Rasterfile .ras 59 a6 6a 95 Y.j
 * Targa format .tga xx xx xx ..
 * TIFF format (Motorola - big endian) .tif 4d 4d 00 2a MM.
 * TIFF format (Intel - little endian) .tif 49 49 2a 00 II*
 * X11 Bitmap format .xbm xx x
 * XCF Gimp file structure .xcf 67 69 6d 70 20 78 63 66 20 76 gimp xc
 * Xfig format .fig 23 46 49 47 #FI
 * XPM format .xpm 2f 2a 20 58 50 4d 20 2a 2f
 * @return {string} image format
 */

export const getImageType = (buffer) => {
    const int8Array = new Uint8Array(buffer);
    const [b0, b1, b2, b3] = int8Array.slice(0, 4);

    // console.log(b0, b1, b2, b3);
    const formats = {
        'png': [],
        'gif': [],
        'bmp': [],
        'jpg': [255, 216, 255, 219],
        'tiff-le': [77, 77, 0, 42],
        'tiff-be': [73, 73, 42, 0],
    };
    const detected = Object.keys(formats).find((type) => {
        return b0 === formats[type][0]
            && b1 === formats[type][1]
            && b2 === formats[type][2]
            && b3 === formats[type][3];
    });
    return detected || 'unknown';
};