/*!
 * MLP.Client.Components.Views.Image
 * File: image.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MetadataView from './metadata.view';
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
    const { node={}, file={}, metadata={}, label='', owner={} } = data || {};
    return (
        <>
            <Accordion
                type={'info'}
                label={`${label} Metadata`}
                hasDependents={true}
                open={false}
            >
                <MetadataView
                    model={model}
                    owner={owner}
                    node={node}
                    metadata={metadata}
                    file={file}
                />
            </Accordion>
            <File
                data={data}
                scale={'medium'}
                owner={owner}
            />
        </>
    )
}

export default ImageView;
