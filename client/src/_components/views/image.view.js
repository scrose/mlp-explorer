/*!
 * MLP.Client.Components.Views.Image
 * File: image.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import { getModelLabel } from '../../_services/schema.services.client';
import Accordion from '../common/accordion';
import File from '../common/file';

/**
 * Image view component.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @return {JSX.Element}
 */

const ImageView = ({data, model}) => {

    const { file={}, metadata={} } = data || {};

    return (
        <>
            <Accordion
                type={'info'}
                label={`${getModelLabel(model)} Metadata`}
                hasDependents={true}
                open={false}
            >
                <Item model={model} metadata={metadata} file={file} />
            </Accordion>
            <File
                data={data}
                scale={'medium'}
            />
        </>
    )
}

export default ImageView;
