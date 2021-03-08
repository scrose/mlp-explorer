/*!
 * MLP.Client.Components.Views.Item
 * File: item.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Loading from '../common/loading';
import NodesView from './nodes.view';
import CaptureView from './capture.view';
import ImageView from './image.view';
import LocationsView from './locations.view';

/**
 * Data item (record) component.
 *
 * @public
 */

const ItemView = ({model, data, dependents}) => {

    // view components indexed by model type
    const itemViews = {
        modern_visits: () => <LocationsView
            locations={dependents}
            metadata={data}
            model={model}
            dependent={'modern_captures'}
        />,
        historic_visits: () => <LocationsView
            locations={[data]}
            metadata={data}
            model={model}
            dependent={'historic_captures'}
        />,
        historic_captures: () => <CaptureView data={ data } model={model} />,
        modern_captures: () => <CaptureView data={ data } model={model} />,
        historic_images: () => <ImageView file={ data } model={model} />,
        modern_images: () => <ImageView file={ data } model={model} />,
        default: () => <NodesView data={ data } model={model} />
    }

    return model && data
        ?
        <>
            {
                itemViews.hasOwnProperty(model)
                    ? itemViews[model]()
                    : itemViews.default()
            }
        </>
        :
        <Loading/>
}

export default ItemView;
