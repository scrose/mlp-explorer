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
import { useUser } from '../../_providers/user.provider.client';
import Button from '../common/button';
import { getNodeURI } from '../../_utils/paths.utils.client';
import Image from '../common/image';
import { getFileLabel } from '../../_services/schema.services.client';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * View available versions of capture images.
 * - The option to master an image version is available for
 *   modern capture images only.
 *
 * @public
 * @param {String} model
 * @param {Array} files
 * @return {JSX.Element}
 */

export const CaptureImagesTable = ({model, files=[]}) => {

    const user = useUser();
    const router = useRouter();

    // prepare capture images columns
    const cols = [
        { name: 'thumbnail', label: 'Image'},
        { name: 'image_state', label: 'State'},
        { name: 'width', label: 'Width'},
        { name: 'height', label: 'Height'},
        { name: 'file_size', label: 'File Size'},
        user && model==='modern_captures'
            ? { name: 'master', label: 'Master' }
            : ''
    ];

    const rows = files.map(fileData => {
        const { file={}, metadata={}, url={} } = fileData || {};
        const {file_type='', id=''} = file || {};
        const rows = {
            thumbnail: <Image
                url={url}
                scale={'thumb'}
                label={getFileLabel(file)}
                title={getFileLabel(file)}
                onClick={()=>{
                    router.update(getNodeURI(file_type, 'show', id))
                }}
            />,
            image_state: sanitize(metadata.image_state),
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize')
        }

        // create option to master modern capture image
        if (user && model==='modern_captures') {
            rows.master = <Button
                label={'Master'}
                icon={'master'}
                onClick={()=>{}} />
        }

        return rows;
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
    const { files={}, metadata={}, node={} } = data || {};
    const captureImages = files.hasOwnProperty(fileType)
        ? files[fileType]
        : [];

    // render node tree
    return (
        <>
            <Accordion
                type={'info'}
                label={`Metadata`}
                open={false}>
                <Item model={model} metadata={metadata} node={node} />
            </Accordion>
            <Slider images={captureImages} />
            <h5>Capture Images</h5>
            <CaptureImagesTable model={model} files={captureImages} />
        </>
    )
}

export default CaptureView;
