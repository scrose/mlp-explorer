/*!
 * MLP.Client.Components.Views.Capture
 * File: capture.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MetadataView, { MetadataAttached } from './metadata.view';
import Accordion from '../common/accordion';
import Slider from '../common/slider';
import Table from '../common/table';
import { sanitize } from '../../_utils/data.utils.client';
import { useUser } from '../../_providers/user.provider.client';
import { getNodeURI } from '../../_utils/paths.utils.client';
import Image from '../common/image';
import { useRouter } from '../../_providers/router.provider.client';
import EditorMenu from '../menus/editor.menu';
import { useData } from '../../_providers/data.provider.client';

/**
 * View available versions of capture images.
 * - The option to master an image version is available for
 *   modern capture images only.
 *
 * @public
 * @param {String} model
 * @param {String} type
 * @param {Object} owner
 * @param {Array} files
 * @return {JSX.Element}
 */

export const CaptureImagesTable = ({type, owner, files=[]}) => {

    const user = useUser();
    const router = useRouter();
    const api = useData();

    // prepare capture images columns
    const cols = [
        { name: 'thumbnail', label: 'Image'},
        { name: 'image_state', label: 'State'},
        { name: 'width', label: 'Width'},
        { name: 'height', label: 'Height'},
        { name: 'file_size', label: 'File Size'}
    ];

    // include editor menu for logged-in users
    if (user) {
        cols.push({ name: 'menu', label: 'Edit Options' })
    }

    // prepare capture image data rows
    const rows = files.map(fileData => {

        const { file={}, metadata={}, url={}, label='', filename='' } = fileData || {};
        const {file_type='', id=''} = file || {};
        const { image_states=[] } = api.options || {};
        // select image state label for value (if available)
        const imageState = image_states.find(opt => opt.value === metadata.image_state);
        const rows = {
            thumbnail: <Image
                url={url}
                scale={'thumb'}
                label={filename}
                title={filename}
                onClick={()=>{
                    router.update(getNodeURI(file_type, 'show', id))
                }}
            />,
            image_state: imageState && imageState.hasOwnProperty('label') ? imageState.label : '',
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize')
        };

        // include file size in metadata
        metadata.file_size = file.file_size;

        // add editor menu for logged-in users
        if (user) {
            rows.menu =  <EditorMenu
                            fileType={type}
                            model={type}
                            id={id}
                            owner={owner}
                            label={label}
                            metadata={metadata}
                          />;
        }
        return rows;
    });

    return  <>
                <h5>Capture Images</h5>
                <Table rows={rows} cols={cols} className={'files'} />
            </>

}

/**
 * Model view component for single capture.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @param fileType
 * @return {JSX.Element}
 */

const CaptureView = ({model, data, fileType}) => {

    const api = useData();

    // select capture data
    const {
        id='',
        files={},
        metadata={},
        node={},
        attached={} } = api.destructure(data);

    // get capture images
    const captureImages = files.hasOwnProperty(fileType)
        ? files[fileType]
        : [];

    // render node tree
    return (
        <>
            <Accordion
                type={'info'}
                label={`Capture Metadata`}
                open={false}>
                <MetadataView model={model} metadata={metadata} node={node} />
            </Accordion>
            {
                captureImages.length > 0 &&
                <>
                    <MetadataAttached owner={node} attached={attached} />
                    <Slider images={captureImages} />
                    <CaptureImagesTable
                        type={fileType}
                        owner={{ id: id, type: model}}
                        files={captureImages}
                    />
                </>
            }
        </>
    )
}

export default CaptureView;
