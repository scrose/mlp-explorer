/*!
 * MLP.Client.Components.Common.File
 * File: file.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Image from './image';
import Download from './download';
import { useRouter } from '../../_providers/router.provider.client';
import { getNodeURI } from '../../_utils/paths.utils.client';
import Loading from './icon';

/**
 * Defines file component.
 *
 * @public
 * @param {Object} data
 * @param {String} callback
 * @param {String} scale
 * @return {JSX.Element}
 */

const File = ({ data, callback=null, scale='thumb' }) => {

    const router = useRouter();

    // destructure file data
    const {label='', file={}, metadata={}, url={}} = data || {};
    const {id='', owner_id='', file_type='', filename='', file_size='' } = file || {};

    // file components indexed by render type
    // - historic images link to their corresponding historic captures
    // - modern images link to their corresponding modern captures
    // - supplemental images link to their corresponding image views
    // - metadata files offer corresponding file downloads
    const renders = {
        historic_images: () => <Image
            url={url}
            scale={scale}
            label={label}
            title={filename}
            onClick={()=>{
                callback
                    ? callback()
                    : router.update(getNodeURI('historic_captures', 'show', owner_id))
            }}
        />,
        modern_images: () => <Image
            url={url}
            scale={scale}
            label={label}
            title={filename}
            onClick={()=>{
                router.update(getNodeURI('modern_captures', 'show', owner_id))
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
