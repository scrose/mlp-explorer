/*!
 * MLP.Client.Components.Common.File
 * File: file.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Image from './image';
import Download from './download';
import { useRouter } from '../../_providers/router.provider.client';
import { createNodeRoute } from '../../_utils/paths.utils.client';

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

const File = ({ data, callback=()=>{}, scale='thumb' }) => {

    const router = useRouter();

    // destructure file data
    const {label='', file={}, url={}} = data || {};
    const {id='', owner_id='', file_type='', filename='' } = file || {};

    // file components indexed by render type
    // - historic images link to their corresponding historic captures
    // - modern images link to their corresponding modern captures
    // - supplemental images link to their corresponding image views
    // - metadata files offer corresponding file downloads
    const renders = {
        historic_images: () => <Image
            url={url}
            scale={scale}
            title={filename}
            caption={label}
            onClick={()=>{router.update(createNodeRoute('historic_captures', 'show', owner_id))}}
        />,
        modern_images: () => <Image
            url={url}
            scale={scale}
            title={filename}
            caption={label}
            onClick={()=>{router.update(createNodeRoute('modern_captures', 'show', owner_id))}}
        />,
        supplemental_images: () => <Image
            url={url}
            scale={scale}
            title={filename}
            caption={label}
            onClick={()=>{router.update(createNodeRoute('supplemental_images', 'show', id))}}
        />,
        default: () => <Download
            filename={filename}
            label={label}
            type={file_type}
            format={'any'}
            route={createNodeRoute(file_type, 'download', id)}
            callback={callback}
        />
    }

    // render file view
    return (
        <div className={file_type}>
            {
                file_type
                    ? renders.hasOwnProperty(file_type)
                        ? renders[file_type]()
                        : renders.default()
                    : <Image
                        scale={'thumb'}
                        title={'No File'}
                        caption={'No File'}
                    />}
        </div>
    )
}

export default File;
