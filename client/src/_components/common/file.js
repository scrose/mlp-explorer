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
import { createNodeRoute } from '../../_utils/paths.utils.client';
import Loading from './loading';

/**
 * Defines file component.
 *
 * @public
 * @param {Object} data
 * @param {String} callback
 * @param {String} scale
 * @param owner
 * @return {JSX.Element}
 */

const File = ({ data, callback=null, scale='thumb', owner={} }) => {

    const router = useRouter();

    // destructure file data
    const {label='', file={}, url={}} = data || {};
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
            label={`${label} ${owner.hasOwnProperty('type') && owner.type !== 'historic_visits' ? '(unsorted)' : ''}`}
            title={filename}
            onClick={()=>{
                callback
                    ? callback()
                    : router.update(createNodeRoute('historic_captures', 'show', owner_id))
            }}
        />,
        modern_images: () => <Image
            url={url}
            scale={scale}
            label={`${label} ${owner.hasOwnProperty('type') && owner.type !== 'locations' ? '(unsorted)' : ''}`}
            title={filename}
            onClick={()=>{
                callback
                    ? callback()
                    : router.update(createNodeRoute('modern_captures', 'show', owner_id))
            }}
        />,
        supplemental_images: () => <Image
            url={url}
            scale={scale}
            label={label}
            title={filename}
            onClick={()=>{
                router.update(createNodeRoute('supplemental_images', 'show', id))
            }}
        />,
        metadata_files: () => <Download
            label={label}
            type={file_type}
            format={'pdf'}
            route={createNodeRoute(file_type, 'download', id)}
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
