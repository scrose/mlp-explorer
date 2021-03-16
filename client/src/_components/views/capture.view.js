/*!
 * MLP.Client.Components.Views.Capture
 * File: capture.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import Accordion from '../common/accordion';
import Slider from '../common/slider';
import File from '../common/file';
import Table from '../common/table';
import { sanitize } from '../../_utils/data.utils.client';

/**
 * View file records as table.
 *
 * @public
 * @return {JSX.Element}
 */

export const CaptureImagesTable = ({files=[]}) => {

    // prepare capture images columns
    const cols = [
        { name: 'thumbnail', label: 'Image'},
        { name: 'image_state', label: 'State'},
        { name: 'width', label: 'Width'},
        { name: 'height', label: 'Height'},
        { name: 'file_size', label: 'File Size'}
    ];

    const rows = files.map(fileData => {
        const { file={}, metadata={} } = fileData || {};
        return {
            thumbnail: <File data={fileData} scale={'thumb'} />,
            image_state: sanitize(metadata.image_state),
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize')
        }
    });

    return <Table rows={rows} cols={cols} classname={'files'}/>

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

    // select capture files
    const { files={}, metadata={} } = data || {};
    const captureImages = files.hasOwnProperty(fileType)
        ? files[fileType]
        : [];

    console.log('Capture Images:', data)

    // render node tree
    return (
        <>
            <Accordion
                type={'info'}
                label={`Metadata`}
                open={false}>
                <Item model={model} data={data} />
            </Accordion>
            <Slider images={captureImages} />
            <h5>Capture Images</h5>
            <CaptureImagesTable files={captureImages} />
        </>
    )
}

export default CaptureView;
