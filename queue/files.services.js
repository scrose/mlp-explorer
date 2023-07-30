/*!
 * MLP.Queue.Services.Files
 * File: files.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import fs from 'fs';
import {unlink} from 'fs/promises';
import queries from '../src/queries/index.queries.js';
import * as cserve from '../src/services/construct.services.js';

/**
 * Capture types.
 */

const captureTypes = ['historic_captures', 'modern_captures'];


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
