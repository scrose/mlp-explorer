/*!
 * MLP.Client.Components.Views.Capture
 * File: capture.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MetadataView from './metadata.view';
import Slider from '../common/slider';
import Table from '../common/table';
import { sanitize } from '../../_utils/data.utils.client';
import { useUser } from '../../_providers/user.provider.client';
import {createNodeRoute, getExtension} from '../../_utils/paths.utils.client';
import Image from '../common/image';
import { useRouter } from '../../_providers/router.provider.client';
import MenuEditor from '../editor/menu.editor';
import { useData } from '../../_providers/data.provider.client';
import { getModelLabel } from '../../_services/schema.services.client';
import Tabs from '../common/tabs';
import ComparisonsView from './comparisons.view';

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
        { name: 'thumbnail', label: 'Image', class: 'image-thumbnail'},
        { name: 'mime_type', label: 'Format'},
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
        const imageState = image_states
            .find(opt => opt.value === metadata.image_state) || { label: metadata.image_state };

        // create table row data
        const row = {
            thumbnail: <Image
                url={url}
                scale={'thumb'}
                label={filename}
                title={filename}
                onClick={()=>{
                    router.update(createNodeRoute(file_type, 'show', id))
                }}
            />,
            mime_type: (metadata.mimetype || getExtension(filename)).toUpperCase(),
            image_state: imageState && imageState.hasOwnProperty('label')
                ? imageState.label
                : 'n/a',
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize')
        };

        // include select file metadata
        metadata.filename = file.filename;
        metadata.file_size = file.file_size;
        metadata.mimetype = file.mimetype;

        // add editor menu for logged-in users
        if (user) {
            row.menu =  <MenuEditor
                            fileType={type}
                            filename={filename}
                            model={type}
                            id={id}
                            owner={owner}
                            label={label}
                            metadata={metadata}
                          />;
        }
        return row;
    });

    return  rows.length > 0
        ? <Table rows={rows} cols={cols} className={'files'} />
        : <div>No Images</div>
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

    // get capture status
    const { status={ sorted: false } } = data || {};

    // get capture images
    const captureImages = files.hasOwnProperty(fileType)
        ? files[fileType]
        : [];

    // create tab index of metadata and files
    const _tabItems = [
        {
            label: `Image Viewer`,
            data: <Slider images={captureImages} />,
        },
        {
            label: `${getModelLabel(model)} Details`,
            data: <MetadataView model={model} metadata={metadata} node={node} />,
        },
        {
            label: `Comparisons`,
            data: Object.keys(attached.comparisons).length > 0
                ? <ComparisonsView data={attached.comparisons} />
                : 'No Paired Images'
        },
        {
            label: `Images`,
            data: <CaptureImagesTable
                    type={fileType}
                    owner={{ id: id, type: model, sorted: status.sorted}}
                    files={captureImages}
                />,
        },
    ];

    // render capture tabs
    return (
        <Tabs items={_tabItems} orientation={'horizontal'} />
    )
}

export default CaptureView;