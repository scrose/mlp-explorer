/*!
 * MLP.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import DefaultView from "./default.view";
import ImageView from './image.view';
import CaptureView from './capture.view';
import Loading from '../common/loading';

/**
 * Data view (node data) component.
 *
 * @param {String} model
 * @param {Object} data
 * @public
 */

const NodesView = ({ model, data = {} }) => {

    // view components indexed by model type
    const nodeViews = {
        historic_captures: () => <CaptureView
            fileType={'historic_images'}
            model={'historic_captures'}
            data={data}
        />,
        modern_captures: () => <CaptureView
            fileType={'modern_images'}
            model={'modern_captures'}
            data={data}
        />,
        historic_images: () => <ImageView
            model={'historic_images'}
            data={data}
        />,
        modern_images: () => <ImageView
            model={'modern_images'}
            data={data}
        />,
        supplemental_images: () => <ImageView
            model={'supplemental_images'}
            data={data}
        />,
        default: () => <DefaultView
            model={model}
            data={data}
        />,
    };

    return <>
        {
            model && data ?
                <>
                    {
                        nodeViews.hasOwnProperty(model)
                            ? nodeViews[model]()
                            : nodeViews.default()
                    }
                </>
                : <Loading />
        }
    </>;
};

export default NodesView;
