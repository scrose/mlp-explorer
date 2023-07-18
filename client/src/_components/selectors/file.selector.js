/*!
 * MLE.Client.Components.Selectors.File
 * File: file.selector.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Image from '../common/image';
import Download from '../common/download';
import {redirect} from "../../_utils/paths.utils.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import {useUser} from "../../_providers/user.provider.client";
import {useDialog} from "../../_providers/dialog.provider.client";

/**
 * Render general file component.
 *
 * @public
 * @param {Object} data
 * @param {String} callback
 * @param {String} scale
 * @return {JSX.Element}
 */

const FileSelector = ({ data, callback=()=>{}, scale='thumb' }) => {

    const user = useUser();
    const dialog = useDialog();

    // destructure file data
    const {label='', file={}, url={}, metadata={} } = data || {};
    const {id='', file_type='', filename='', file_size='', mimetype='' } = file || {};
    let itemMetadata = metadata
    // include file metadata in details
    itemMetadata.filename = filename;
    itemMetadata.file_size = file_size;
    itemMetadata.mimetype = mimetype;

    // handle dialog view
    // - sets image metadata in provider to load in dialog view
    const _handleDialog = (e) => {
        e.stopPropagation();

        // Click: go to image page
        // Shift + click: show metadata
        e.shiftKey
            ? dialog.setCurrent({
                dialogID: 'show',
                id: id,
                model: file_type,
                label: label,
                metadata: metadata,
             })
            : redirect(createNodeRoute(file_type, 'show', id));
    }

    // file components indexed by render type
    // - historic images link to their corresponding historic captures
    // - modern images link to their corresponding modern captures
    // - supplemental images link to their corresponding image views
    // - metadata files offer corresponding file downloads
    const renders = {
        historic_images: () => <Image
            url={url}
            scale={scale}
            title={`Click to go to ${filename} page. \nShift + Click to see metadata.`}
            caption={label}
            onClick={_handleDialog}
        />,
        modern_images: () => <Image
            url={url}
            scale={scale}
            title={`Click to go to ${filename} page. \nShift + Click to see metadata.`}
            caption={label}
            onClick={_handleDialog}
        />,
        supplemental_images: () => <Image
            url={url}
            scale={scale}
            title={`Click to go to ${filename} page. \nShift + Click to see metadata.`}
            caption={label}
            onClick={_handleDialog}
        />,
        default: () => <Download
            filename={`${filename}.zip`}
            label={label}
            type={file_type}
            format={'zip'}
            route={user ? `/files/download/raw?${file_type}=${id}` : `/files/download/${id}`}
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
                        onClick={_handleDialog}
                    />}
        </div>
    )
}

export default FileSelector;
