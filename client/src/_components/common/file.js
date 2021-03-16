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
import { useRouter } from '../../_providers/router.provider.client';
import { getNodeURI } from '../../_utils/paths.utils.client';

/**
 * Defines file component.
 *
 * @public
 * @param {Object} data
 * @param {String} scale
 * @return {JSX.Element}
 */

const File = ({ data, scale='thumb' }) => {

    const router = useRouter();

    // destructure file data
    const {file={}, metadata={}, url={}} = data || {};
    const {id='', file_type='', filename='', file_size='' } = file || {};
    const label = getFileLabel(file);

    // file components indexed by render type
    const renders = {
        historic_images: () => <Image
            url={url}
            scale={scale}
            label={label}
            title={filename}
            onClick={()=>{
                router.update(getNodeURI('historic_images', 'show', id))
            }}
        />,
        modern_images: () => <Image
            url={url}
            scale={scale}
            label={label}
            title={filename}
            onClick={()=>{
                router.update(getNodeURI('modern_images', 'show', id))
            }}
        />,
        supplemental_images: () => <Image
            url={url}
            scale={scale}
            label={label}
            title={filename}
            onClick={()=>{
                router.update(getNodeURI('supplemental_images', 'show', id))
            }}
        />,
        metadata_files: () => <Download
            label={label}
            type={file_type}
            id={id}
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
