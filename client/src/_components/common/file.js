/*!
 * MLP.Client.Components.Common.File
 * File: file.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Loading from './loading';
import Image from './image';
import { getFileLabel } from '../../_services/schema.services.client';
import Download from './download';

/**
 * Defines file component.
 *
 * @public
 * @param {Object} data
 * @param {String} scale
 * @return {JSX.Element}
 */

const File = ({ data, scale='thumb' }) => {

    // destructure file data
    const {file={}, metadata={}, url={}} = data || {};
    const {files_id, file_type, filename, file_size } = file || {};
    const label = getFileLabel(file);

    // file components indexed by render type
    const renders = {
        historic_images: () => <Image
            type={file_type}
            id={files_id}
            url={url}
            scale={scale}
            label={label}
            title={filename}
        />,
        modern_images: () => <Image
            type={file_type}
            id={files_id}
            url={url}
            scale={scale}
            label={label}
            title={filename}
        />,
        supplemental_images: () => <Image
            type={file_type}
            id={files_id}
            url={url}
            scale={scale}
            label={label}
            title={filename}
        />,
        metadata_files: () => <Download
            label={label}
            type={file_type}
            id={files_id}
            url={url}
            size={file_size}
        />
    }

    // render file view
    return (
        <div className={file_type}>
            { renders.hasOwnProperty(file_type) ? renders[file_type]() : <Loading/> }
        </div>
    )
}

export default File;
