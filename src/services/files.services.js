/*!
 * MLP.API.Services.Files
 * File: files.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import path from 'path';
import fs from 'fs';
import {copyFile, mkdir, unlink} from 'fs/promises';
import pool from './db.services.js';
import queries from '../queries/index.queries.js';
import {sanitize} from '../lib/data.utils.js';
import * as cserve from './construct.services.js';
import * as metaserve from '../services/metadata.services.js';
import ModelServices from './model.services.js';
import {allowedMIME, extractFileLabel} from '../lib/file.utils.js';
import {getImageURL, saveImage} from './images.services.js';
import {updateComparisons} from "./comparisons.services.js";
import * as nserve from "./nodes.services.js";

/**
 * Maximum file size (non-images) = 1GB
 */

const MAX_FILE_SIZE = 1e9;

/**
 * Capture types.
 */

const captureTypes = ['historic_captures', 'modern_captures'];

/**
 * Get file record by ID. NOTE: returns single object.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const select = async function(id, client = pool) {
    let { sql, data } = queries.files.select(id);
    let file = await client.query(sql, data);
    return file.rows[0];
};

/**
 * Get file label.
 *
 * @public
 * @param {Object} file
 * @param client
 * @return {Promise} result
 */

export const getFileLabel = async (file, client = pool) => {

    if (!file) return '';
    const {file_type = '', owner_id = '', filename = ''} = file || {};

    // get image owner
    const owner = await nserve.select(sanitize(owner_id, 'integer'), client);
    // check that owner node exists
    if (!owner) return '';
    const metadata = await nserve.selectByNode(owner, client);

    const queriesByType = {
        historic_images: async () => {
            const {fn_photo_reference = ''} = metadata || {};
            return fn_photo_reference
                ? fn_photo_reference
                : extractFileLabel(filename, 'Capture Image');
        },
        modern_images: async () => {
            const {fn_photo_reference = ''} = metadata || {};
            return fn_photo_reference
                ? fn_photo_reference
                : extractFileLabel(filename, 'Capture Image');
        },
        default: async () => {
            return extractFileLabel(filename, filename) || 'File Unknown';
        }
    };

    return queriesByType.hasOwnProperty(file_type)
        ? await queriesByType[file_type]() : queriesByType.default();

};
/**
 * Get file data by file ID. Returns single node object.
 *
 * @public
 * @param {String} id
 * @param client
 * @return {Promise} result
 */

export const get = async (id, client = pool) => {

    if (!id) return null;

    // get requested file
    const file = await select(sanitize(id, 'integer'), client);

    // check that file exists
    if (!file) return null;

    // get associated file metadata
    const metadata = await selectByFile(file, client) || {};
    const { type = '', secure_token = '' } = metadata || {};
    const { file_type = '', filename = '', owner_id = '' } = file || {};
    const owner = await nserve.select(owner_id, client) || {};

    // include alternate extracted filename (omit the security token)
    return {
        file: file,
        owner: owner,
        label: await getFileLabel(file, client),
        filename: (filename || '').replace(`_${secure_token}`, ''),
        metadata: metadata,
        metadata_type: await metaserve.selectByName('metadata_file_types', type, client),
        url: getImageURL(file_type, metadata),
        status: await metaserve.getStatus(owner, metadata, client),
    };

};

/**
 * Get files for given owner.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const selectByOwner = async (id, client = pool) => {

    // get all dependent files for requested owner
    const { sql, data } = queries.files.selectByOwner(id);
    const { rows = [] } = await client.query(sql, data);

    // append full data for each dependent node
    let files = await Promise.all(
        rows.map(
            async (file) => {
                const { file_type = '', filename = '' } = file || {};
                const fileMetadata = await selectByFile(file, client);
                const { type = '', secure_token = '' } = fileMetadata || {};
                return {
                    file: file,
                    label: await getFileLabel(file),
                    filename: (filename || '').replace(`_${secure_token}`, ''),
                    metadata: fileMetadata,
                    metadata_type: await metaserve.selectByName('metadata_file_types', type, client),
                    url: getImageURL(file_type, fileMetadata),
                };
            }),
    );

    // group files by type
    return files.reduce((o, f) => {
        const { file = {} } = f || {};
        const { file_type = 'files' } = file || {};

        // create file group
        if (!o.hasOwnProperty(file_type)) {
            o[file_type] = [];
        }

        // add file to group
        o[file_type].push(f);
        return o;
    }, {});
};

/**
 * Check if node has attached files.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {boolean} result
 */

export const hasFiles = async (id, client = pool) => {
    let { sql, data } = queries.files.hasFile(id);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows') && res.rows.length > 0
                ? res.rows[0].exists
                : false;
        });
};

/**
 * Get model data by file reference. Returns single node object.
 *
 * @public
 * @param {Object} file
 * @param client
 * @return {Promise} result
 */

export const selectByFile = async (file, client = pool) => {
    let { sql, data } = queries.defaults.selectByFile(file);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows[0] : {};
        });
};

/**
 * Insert file(s) and file metadata.
 * - import data structure:
 *  {
 *      files: { file(s) and file metadata },
 *      data: { additional metadata, e.g. image metadata },
 *      owner: { file(s) owner metadata }
 *  }
 *
 * @public
 * @param {Object} importData
 * @param {String} model
 * @param {Object} fileOwner
 * @return {Promise} result
 */

export const insert = async (importData, model, fileOwner = null) => {

    const { files = {}, data = {}, owner = {} } = importData || {};
    const metadata = data;

    // filter image states from imported metadata
    // - for multiple images, image state is indexed by file key
    const imageState = metadata.image_state;

    // reject null parameters
    if (
        Object.keys(files).length === 0
        || Object.keys(fileOwner || owner || {}).length === 0
        || Object.keys(metadata).length === 0
    ) {
        return null;
    }

    // init transaction result
    let res;

    // initialize immediate file owners for given file type
    const initFileOwners = {

        // file is a capture image
        captures: async () => {

            // initialize capture database services
            const CaptureModel = await cserve.create(model);
            const mserve = new ModelServices(new CaptureModel());

            // remove image state from capture data (not in model)
            delete metadata.image_state;

            // insert new capture owner for image file
            const capture = new CaptureModel(metadata);
            const captureData = await mserve.insert(capture);

            // get new capture node metadata
            const { nodes_id = '' } = captureData || {};
            const newCapture = await nserve.select(nodes_id) || {};
            const { fs_path = '', type='' } = newCapture || {};

            // check for any capture comparison updates
            const { historic_captures = {}, modern_captures = {} } = data || {};
            const comparisonCaptures = type === 'historic_captures'
                ? Object.values(modern_captures)
                : Object.values(historic_captures);
            await updateComparisons(newCapture, comparisonCaptures, client);

            return {
                id: nodes_id,
                type: model,
                fs_path: fs_path,
            };
        },

        // owner already exists
        default: async () => {
            return {
                id: owner.id,
                type: owner.type,
                fs_path: owner.fs_path,
            };
        },
    };

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {

        // start import transaction
        await client.query('BEGIN');

        // use existing or create file owner instance
        fileOwner = fileOwner
            ? fileOwner
            : captureTypes.includes(model)
                ? await initFileOwners.captures()
                : await initFileOwners.default();

        // get file options
        const options = await metaserve.getMetadataOptions();

        // saves attached files and inserts metadata record for each
        res = await Promise
            .all(Object.keys(files)
                .map(async (key) => {
                    await saveFile(
                        key,
                        importData,
                        fileOwner,
                        imageState,
                        options,
                        (err) => {
                            throw new Error(err);
                        });
                }));

        await client.query('COMMIT');

        // return confirmation data
        return res;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

};

/**
 * Update file metadata in existing record.
 *
 * @public
 * @param item
 * @param client
 * @return {Promise} result
 */

export const update = async (item, client = pool) => {

    let { sql, data } = queries.files.update(item);
    let response = await client.query(sql, data);

    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
};

/**
 * Delete file(s) and metadata for given file entry.
 *
 * @param {Object} file
 * @param filepaths
 * @param client
 * @return Response data
 * @public
 */

export const remove = async (file=null, filepaths, client = pool) => {

    // [1] delete attached files
    // - assumes file paths are to regular files.
    // - requires removal of static slug from file path
    //   as set in Express static-serve
    await Promise.all(
        filepaths.map(async (filePath) => {
            fs.stat(filePath, async (err, stat) => {
                if (err == null) {
                    return await unlink(filePath);
                } else if (err.code === 'ENOENT') {
                    // file does not exist (ignore)
                    console.warn(err);
                    return null;
                } else {
                    throw err;
                }
            });
        }),
    );

    // [2] remove file node record (if provided)
    if (file) {
        let {sql, data} = queries.files.remove(file);
        let response = await client.query(sql, data) || [];

        // response data
        return response.hasOwnProperty('rows') && response.rows.length > 0
            ? response.rows[0]
            : null;
    }
};

/**
 * Download file stream.
 *
 * @src public
 * @param res
 * @param src
 */

export const download = async (res, src) => {
    return new Promise(async (resolve, reject) => {
        try {
            const readStream = fs.createReadStream(src);
            readStream.pipe(res);

            readStream.on('error', (err) => {
                console.warn('Error in read stream...', err);
            });
            res.on('error', (err) => {
                console.warn('Error in write stream...', err);
            });

        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Build file source path for resampled images and metadata files
 * from file data.
 *
 * @public
 * @param {String} type
 * @param file
 * @param metadata
 * @return {Promise} result
 */

export const getFilePath = (type, file, metadata = {}) => {

    const { fs_path = '' } = file || {};
    const { secure_token = '' } = metadata || {};

    // ======================================================
    // DEVELOPMENT TEST
    // TODO: TO BE REMOVED IN PRODUCTION
    // - check if using MEAT images or local ones
    // ======================================================
    // const rootURI = metadata.channels
    //     ? process.env.LOWRES_PATH
    //     : `${process.env.DEV_API_HOST}/versions/`;
    const rootURI =`${process.env.API_HOST}/uploads/`;

    // ======================================================

    // handle image source URLs differently than metadata files
    // - images use scaled versions of raw files
    // - metadata uses PDF downloads
    const fileHandlers = {
        historic_images: () => {
            return path.join(rootURI, `${secure_token}.jpeg`);
        },
        modern_images: () => {
            return path.join(rootURI, `${secure_token}.jpeg`);
        },
        supplemental_images: () => {
            return path.join(rootURI, `${secure_token}.jpeg`);
        },
        default: () => {
            return path.join(path.join(process.env.UPLOAD_DIR, fs_path));
        },
    };

    // Handle file types
    return fileHandlers.hasOwnProperty(type)
        ? fileHandlers[type]()
        : fileHandlers.default();
};

/**
 * Callback process for file uploads.
 *
 * @src public
 * @param index
 * @param importData
 * @param owner
 * @param imageStateData
 * @param options
 * @param callback
 */

export const saveFile = async (
    index,
    importData,
    owner,
    imageStateData = null,
    options,
    callback = console.warn,
) => {

    // define file upload promises
    let filePromises = [];

    // get file data object
    let fileData = importData.files[index];
    // copy metadata to file data object
    fileData.data = importData.data;

    // get file type
    const { file_type = '', mimetype = '', filename = '' } = fileData.file || {};

    // get image state (for image uploads)
    // - for multiple image files, image state is indexed by the file index
    const imageState = !imageStateData || typeof imageStateData === 'string'
        ? imageStateData
        : imageStateData[index];

    // reject null file data
    if (!file_type || !mimetype || !filename) throw new Error();

    // handle file upload procedure based on file type
    const _fileHandlers = {
        historic_images: async () => {
            await saveImage(filename, fileData, owner, imageState || 'no_state', options);
        },
        modern_images: async () => {
            await saveImage(filename, fileData, owner, imageState || 'no_state', options);
        },
        supplemental_images: async () => {
            await saveImage(filename, fileData, owner, 'supplemental_images', options);
        },
        default: async () => {
            // check for supported MIME type
            if (!allowedMIME(mimetype)) throw new Error('invalidMIMEType');
            const saveType = importData.data.hasOwnProperty('type') ? importData.data.type : 'unknown';

            // create raw path directory (if does not exist)
            const uploadPath = path.join(process.env.UPLOAD_DIR, owner.fs_path, saveType);
            await mkdir(uploadPath, { recursive: true });
            const filePath = path.join(uploadPath, filename);

            // get file size
            const fileSize = (await fs.promises.stat(fileData.tmp)).size;
            if (fileSize > MAX_FILE_SIZE) throw new Error('overMaxSize');

            // update file metadata
            // - NOTE: ensure saved filesystem path does not include upload directory
            fileData.file.owner_type = owner.type;
            fileData.file.owner_id = owner.id;
            fileData.file.fs_path = path.join(owner.fs_path, saveType, filename);
            fileData.file.file_size = fileSize;

            // copy file to data storage
            await copyFile(fileData.tmp, filePath, fs.constants.COPYFILE_EXCL);

            // insert file record in database
            await insertFile(fileData, owner, imageState);
        },
    };

    // process file by type
    _fileHandlers.hasOwnProperty(file_type)
        ? await _fileHandlers[file_type]()
        : await _fileHandlers.default();

    return Promise.all(filePromises);
};

/**
 * Save file metadata to database.
 *
 * @src public
 * @param importData
 * @param owner
 * @param imageState
 * @param callback
 * @param client
 */

export const insertFile = async (
    importData,
    owner,
    imageState,
    callback=console.error,
    client=pool) => {

    // get imported metadata
    const { data = {}, file = {} } = importData || {};
    const { file_type = '' } = file || {};

    // update file owner data
    data.owner_id = owner.id;
    file.owner_id = owner.id;
    file.owner_type = owner.type;

    // include image state for capture images
    if (imageState && captureTypes.includes(owner.type)) {
        data.image_state = typeof imageState === 'string'
            ? imageState
            : imageState[key];
    }

    // initialize file model services
    // - create new file model instance from file-specific data
    const FileModel = await cserve.create(file_type);
    const fileItem = new FileModel(data);

    // include model-specific data if NOT handling capture file
    if (!captureTypes.includes(owner.type)) {
        fileItem.setData(data);
    }

    // create file node instance
    // - use file model instance with extracted file data
    let fileNode = await cserve.createFile(fileItem, file);
    const stmtFileNode = queries.files.insert(fileNode);
    let fileRes = await client.query(stmtFileNode.sql, stmtFileNode.data);

    // update file metadata files_id with created file ID, defined image state
    const { id = '' } = fileRes.hasOwnProperty('rows') && fileRes.rows.length > 0
        ? fileRes.rows[0] || {}
        : {};
    fileItem.id = id;

    // insert file metadata as new record
    // NOTE: need to define different query than current services object model
    const stmtFileData = queries.defaults.insert(fileItem)(fileItem);
    let modelRes = await client.query(stmtFileData.sql, stmtFileData.data);

    // return confirmation data
    return modelRes.hasOwnProperty('rows') && modelRes.rows.length > 0
        ? {
            file: fileRes.rows[0],
            metadata: modelRes.rows[0],
        }
        : null;
}
