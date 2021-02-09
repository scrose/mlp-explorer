/*!
 * MLP.Client.Components.Common.File
 * File: file.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Loading from './loading';
import Button from './button';
import Image from './image';

/**
 * Defines file component.
 *
 * @public
 * @param {Object} data
 * @param scale
 * @return {JSX.Element}
 */

const File = ({ data, scale='thumb' }) => {

    // destructure file data
    const {file_type, url, filename} = data || {};

    // file components indexed by render type
    const renders = {
        image: () => <Image
            src={url}
            className={`${scale}`}
            alt={filename}
            title={filename}
        />,
        metadata_files: () => <Button
            icon={file_type}
            label={filename}
            title={filename}
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
