/*!
 * MLP.API.Utilities.Files
 * File: files.utils.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Extracts label for given file.
 * - extracts prefix from filename to use as a label.
 *
 * @public
 * @return {String} label
 * @param filename
 * @param defaultLabel
 */

export const extractFileLabel = (filename, defaultLabel='Unknown') => {

    if (!filename) return defaultLabel;

    // extract prefix substring from filename to omit key token string
    // - looks for last underscore '_' in filename as index
    // - OR looks for last dot '.' in filename as index
    const lastIndex = filename.lastIndexOf('_') > 0
        ? filename.lastIndexOf('_')
        : filename.lastIndexOf('.');
    const abbrevFilename = filename.substring(0, lastIndex);

    // Handle empty file labels
    return abbrevFilename ? abbrevFilename : defaultLabel;
}

/**
 * CSV parser for JSON data.
 *
 * @param {Object} json
 * @return {String} CSV data
 * @src public
 */

export function json2csv(json) {
    let fields = Object.keys(json[0])
    let replacer = function(key, value) { return value === null ? '' : value }
    let csv = json.map(function(row){
        return fields.map(function(fieldName){
            return JSON.stringify(row[fieldName], replacer)
        }).join(',')
    })
    csv.unshift(fields.join(',')) // add header column
    return csv.join('\r\n');
}

/**
 * Lookup allowed mimetype from file extension.
 *
 * @src public
 * @param filename
 * @return {String} mimetype
 */

export function getMIME(filename) {
    const ext = filename.split('.').pop();
    const mime_types = {
        'pdf': 'application/pdf',
        'bm': 'image/bmp',
        'bmp': 'image/bmp',
        'gif': 'image/gif',
        'jpe': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'tif': 'image/tiff',
        'tiff': 'image/tiff',
        'x-png': 'image/png',
        'ARW': 'image/x-sony-arw',
        'CR2': 'image/x-canon-cr2',
        'CRW': 'image/x-canon-crw',
        'DCR': 'image/x-kodak-dcr',
        'DNG': 'image/x-adobe-dng',
        'ERF': 'image/x-epson-erf',
        'K25': 'image/x-kodak-k25',
        'KDC': 'image/x-kodak-kdc',
        'MRW': 'image/x-minolta-mrw',
        'NEF': 'image/x-nikon-nef',
        'ORF': 'image/x-olympus-orf',
        'PEF': 'image/x-pentax-pef',
        'RAF': 'image/x-fuji-raf',
        'RAW': 'image/x-panasonic-raw',
        'SR2': 'image/x-sony-sr2',
        'SRF': 'image/x-sony-srf',
        'X3F': 'image/x-sigma-x3f'
    };
    return mime_types.hasOwnProperty(ext) ? mime_types[ext] : null;
}

