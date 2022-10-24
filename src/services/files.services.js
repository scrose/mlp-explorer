/*!
 * MLP.API.Services.Files
 * File: files.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import path from 'path';
import fs from 'fs';
import {copyFile, mkdir, unlink, rename} from 'fs/promises';
import pool from './db.services.js';
import queries from '../queries/index.queries.js';
import {sanitize} from '../lib/data.utils.js';
import * as cserve from './construct.services.js';
import * as metaserve from '../services/metadata.services.js';
import ModelServices from './model.services.js';
import {allowedImageMIME, allowedMIME, extractFileLabel} from '../lib/file.utils.js';
import {getImageURL, saveImage} from './images.services.js';
import {updateComparisons} from "./comparisons.services.js";
import * as nserve from "./nodes.services.js";
import AdmZip from 'adm-zip';
import {Readable} from "stream";

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

export const select = async function(id, client ) {
    let { sql, data } = queries.files.select(id);
    let file = await client.query(sql, data);
    return file.rows[0];
};


/**
 * Get list of requested files by IDs.
 *
 * @public
 * @params {Array} filesID
 * @params {int} offset
 * @params {int} limit
 * @return {Promise} result
 */

export const filterFilesByID = async (fileIDs, offset, limit) => {

    if (!fileIDs) return null;

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        // get filtered nodes
        let { sql, data } = queries.files.filterByIDArray(fileIDs, offset, limit);
        let files = await client.query(sql, data)
            .then(res => {
                return res.rows
            });

        const count = files.length > 0 ? files[0].total : 0;

        // end transaction
        await client.query('COMMIT');

        return {
            query: fileIDs,
            limit: limit,
            offset: offset,
            results: files,
            count: count
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        await client.release(true);
    }
};

/**
 * Get file label.
 *
 * @public
 * @param {Object} file
 * @param client
 * @return {Promise} result
 */

export const getFileLabel = async (file, client) => {

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
 * @param {Int|String} id
 * @param client
 * @return {Promise} result
 */

export const get = async (id, client ) => {

    if (!id) return null;

    // get requested file
    const file = await select(sanitize(id, 'integer'), client);

    // check that file exists
    if (!file) return null;

    // get associated file metadata
    const metadata = await selectByFile(file, client) || {};
    const { type = '', secure_token = '' } = metadata || {};
    const { file_type = '', filename = '', owner_id=0 } = file || {};
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
        status: await metaserve.getStatus(owner, client),
    };

};

/**
 * Select files attached to a given owner (Does not include dependent files).
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const selectByOwner = async (id, client ) => {

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
                    label: await getFileLabel(file, client),
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
 * Select all files under a given node
 *
 * @public
 * @params {Object} owner
 * @return {Promise} result
 */

export const selectAllByOwner = async (id) => {

    if (!id) return null;

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    let results = {}

    // query handlers for different file types
    const handlers = {
        historic_images: async () => {
            const {sql, data} = queries.files.getHistoricImageFilesByStationID(id);
            const {rows = []} = await client.query(sql, data);
            return rows.map(row => {
                row.url = getImageURL('historic_images', row);
                return row
            });
        },
        modern_images: async () => {
            const {sql, data} = queries.files.getModernImageFilesByStationID(id);
            const {rows = []} = await client.query(sql, data);
            return rows.map(row => {
                row.url = getImageURL('modern_images', row);
                return row
            });
        },
        unsorted_images: async () => {
            const {sql, data} = queries.files.getUnsortedImageFilesByStationID(id);
            const {rows = []} = await client.query(sql, data);
            return rows.map(row => {
                row.url = getImageURL('modern_images', row);
                return row
            });
        }
    }

    try {
        // start transaction
        await client.query('BEGIN');

        // get all dependent files for requested owner
        results.historic_images = await handlers.historic_images();
        results.modern_images = await handlers.modern_images();
        results.unsorted_images = await handlers.unsorted_images();

        await client.query('COMMIT');
        return results

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        await client.release(true);
    }
};

/**
 * Check if node has attached files.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise}
 */

export const hasFiles = async (id, client) => {
    let { sql, data } = queries.files.hasFile(id);
    return await client.query(sql, data)
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

export const selectByFile = async (file, client ) => {
    let { sql, data } = queries.defaults.selectByFile(file);
    return await client.query(sql, data)
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

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {

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
                const captureData = await mserve.insert(capture, client);

                // get new capture node metadata
                const { nodes_id = 0 } = captureData || {};
                const newCapture = await nserve.select(nodes_id, client) || {};
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

        // start import transaction
        await client.query('BEGIN');

        // use existing or create file owner instance
        fileOwner = fileOwner
            ? fileOwner
            : captureTypes.includes(model)
                ? await initFileOwners.captures()
                : await initFileOwners.default();

        // get file options
        const options = await metaserve.getMetadataOptions(client);

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
                        client
                    );
                }));

        await client.query('COMMIT');

        // return confirmation data
        return res;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        await client.release(true);
    }

};

/**
 * Update file metadata in existing record.
 *
 * @public
 * @param file
 * @param metadata
 * @param client
 * @return {Promise} result
 */

export const update = async (file, metadata, client) => {

    // update files record
    const fileQuery = queries.files.update(file);
    await client.query(fileQuery.sql, fileQuery.data);

    // update metadata record
    const metadataQuery = queries.files.update(metadata);
    let response = await client.query(metadataQuery.sql, metadataQuery.data);

    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;

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
 * Compress requested files in a zipped folder
 * - input param contains file objects
 *
 * @param {Object} files
 * @param {String} version
 * @param {Object} metadata
 * @return Response data
 * @public
 */

export const compress = async (files={}, version, metadata={}) => {

    // creating new archive (ADM-ZIP)
    let zip = new AdmZip();

    // add requested files to archive; separate different file types in folders
    await Promise.all(
        Object.keys(files).map(async (fileType) => {
            await Promise.all(
                files[fileType].map(async (file) => {
                    // get file path for given version type
                    const filePath = getFilePath(version, file, metadata);
                    // places file in a subfolder labelled by image/file type
                    // - only include files that exist
                    if (fs.existsSync(filePath)) zip.addLocalFile(filePath, fileType);
                })
            )}
        )
    );

    // return file buffer
    return zip.toBuffer();
};


/**
 * Build file source path for resampled images and metadata files
 * from file data.
 *
 * @public
 * @param {String} version
 * @param file
 * @param metadata
 * @return {String} result
 */

export const getFilePath = (version, file, metadata = {}) => {

    const { fs_path = '' } = file || {};
    const { secure_token = '' } = metadata || {};
    const rootURI = process.env.LOWRES_PATH;
    const imgPrefix = 'medium';

    // handle image source URLs differently than metadata files
    // - images use scaled versions of raw files
    // - metadata uses PDF downloads
    const fileHandlers = {
        historic_images: () => {
            return path.join(rootURI, `${imgPrefix}_${secure_token}.jpeg`);
        },
        modern_images: () => {
            return path.join(rootURI, `${imgPrefix}_${secure_token}.jpeg`);
        },
        supplemental_images: () => {
            return path.join(rootURI, `${imgPrefix}_${secure_token}.jpeg`);
        },
        default: () => {
            return path.join(path.join(process.env.UPLOAD_DIR, fs_path));
        },
    };

    // Handle file types
    return fileHandlers.hasOwnProperty(version)
        ? fileHandlers[version]()
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
 * @param client
 */

export const saveFile = async (
    index,
    importData,
    owner,
    imageStateData = null,
    options,
    client
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

    const _handleError = (err) =>{throw new Error(err);}

    // handle file upload procedure based on file type
    const _fileHandlers = {
        historic_images: async () => {
            // check for supported MIME types
            if (!allowedImageMIME(mimetype)) throw new Error('invalidMIMEType');
            await saveImage(filename, fileData, owner, imageState || 'no_state', options);
        },
        modern_images: async () => {
            // check for supported MIME types
            if (!allowedImageMIME(mimetype)) throw new Error('invalidMIMEType');
            await saveImage(filename, fileData, owner, imageState || 'no_state', options);
        },
        supplemental_images: async () => {
            // check for supported MIME types
            if (!allowedImageMIME(mimetype)) throw new Error('invalidMIMEType');
            await saveImage(filename, fileData, owner, 'supplemental_images', options);
        },
        default: async (client) => {
            // check for supported MIME types
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
            await insertFile(fileData, owner, imageState, _handleError, client);
        },
    };

    // process file by type
    _fileHandlers.hasOwnProperty(file_type)
        ? await _fileHandlers[file_type](client)
        : await _fileHandlers.default(client);

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
    client) => {

    // get imported metadata
    const { data = {}, file = {} } = importData || {};
    const { file_type = '' } = file || {};

    // update file owner data
    data.owner_id = owner.id;
    file.owner_id = owner.id;
    file.owner_type = owner.type;
    file.file_type = file_type;

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
    let fileNode = await cserve.createFile(file);
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

/**
 * Move files to new owner (container)
 *
 * @src public
 * @param files
 * @param node
 * @param client
 */

export const moveFiles = async (files, node, client) => {
    await Promise.all(
        // handle move for each file type
        Object.keys(files).map(async (fileType) => {
            await Promise.all(
                // handle move for each file
                files[fileType].map(async (fileData) => {
                    const {metadata = {}, file = {}} = fileData || {};
                    const {image_state = '', secure_token = ''} = metadata || {};
                    const {filename = '', file_type = ''} = file || {};

                    // insert token into filename
                    const tokenizedFilename = [
                        filename.slice(0, filename.lastIndexOf('.')),
                        secure_token,
                        filename.slice(filename.lastIndexOf('.'))
                    ].join('');

                    // check node has file directory path
                    if (!node.getValue('fs_path') || !file.fs_path) return null;

                    // get the old file path
                    const oldFileUploadPath = path.join(process.env.UPLOAD_DIR, file.fs_path);
                    // create new directory and file path (create directory if does not exist)
                    const newFileNodePath = path.join(node.getValue('fs_path'), image_state || file_type);
                    const newFileUploadDir = path.join(process.env.UPLOAD_DIR, newFileNodePath);
                    await mkdir(newFileUploadDir, {recursive: true});
                    // move file to new directory path
                    const newFileUploadPath = path.join(newFileUploadDir, tokenizedFilename);
                    // rename file path (if exists)
                    if (fs.existsSync(oldFileUploadPath)) await rename(oldFileUploadPath, newFileUploadPath);

                    // update owner in file metadata model
                    const FileModel = await cserve.create(file_type);
                    const fileMetadata = new FileModel(metadata);
                    fileMetadata.owner = node.id;

                    // updated file path in file model
                    let fileNode = await cserve.createFile(file);
                    fileNode.setValue('fs_path', path.join(newFileNodePath, tokenizedFilename));

                    // create file node instance from file model instance
                    await update(fileNode, fileMetadata, client);
                })
            );
        })
    );
}

/**
 * Delete model-type-indexed files and metadata.
 *
 * @param files
 * @param client
 * @return Response data
 * @public
 */

export const removeAll = async (files=null, client ) => {
    await Promise.all(
        Object.keys(files).map(
            async (file_type) => {
                await Promise.all(
                    files[file_type].map( async (file) => {
                        return await remove(file, client);
                    }));
            })
    );
}

/**
 * Delete file(s) and metadata for given file entry.
 *
 * @param fileItem
 * @param client
 * @return Response data
 * @public
 */

export const remove = async (fileItem=null, client ) => {
    const { file=null, url=null } = fileItem || {};
    const { id='', fs_path='' } = file || {};

    // create filepath array (include original or raw file)
    let filePaths = [path.join(process.env.UPLOAD_DIR, fs_path)];

    // include any image resampled versions (if applicable)
    if (url) {
        Object.keys(url).reduce((o, key) => {
            const filename = url[key].pathname.replace(/^.*[\\\/]/, '');
            o.push(path.join(process.env.LOWRES_PATH, filename));
            return o;
        }, filePaths)
    }

    // [1] remove file + metadata records
    const {sql, data} = queries.files.remove(id);
    const response = await client.query(sql, data) || [];

    // [2] delete attached files
    // - assumes file paths are to regular files.
    await deleteFiles(filePaths);

    // return response data
    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
};

/**
 * Delete files from filesystem (by file paths).
 *
 * @param filePaths
 * @return Response data
 * @public
 */

export const deleteFiles = async (filePaths=[]) => {
    await Promise.all(
        filePaths.map(async (filePath) => {
            fs.stat(filePath, async (err) => {
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
        })
    );
};

/**
 * Stream readable data to response
 * - pushes data buffer to readable stream
 *
 * @return Response data
 * @public
 * @param res
 * @param buffer
 */

export const streamDownload = (res, buffer) => {
    let rs = new Readable();
    rs._read = () => {}; // may be redundant
    rs.pipe(res);
    rs.on('error',function(err) {
        console.error(err)
        res.status(404).end();
    });
    rs.push(buffer);
    rs.push(null);
}
