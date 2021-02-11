/*!
 * MLP.Client.Components.Views.Captures
 * File: captures.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import { FilesTable } from './files.view';
import File from '../common/file';
import Image from '../common/image';
import { getFileLabel } from '../../_services/schema.services.client';

/**
 * Image view component.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @return {JSX.Element}
 */

const ImageView = ({file, model}) => {

    const { data={} } = file || {};
    const { filename='', file_type=model, files_id='', url='' } = data || {};

    // generate image label
    const label = getFileLabel(file);

    // render image preview
    return (
        <div className={`item`}>
            <Item view={'show'} model={file_type} data={data} />
            <Image
                type={file_type}
                id={files_id}
                url={url}
                scale={'medium'}
                label={label}
                title={label}
            />
        </div>
    )
}

export default ImageView;
