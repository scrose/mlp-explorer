/*!
 * MLP.Client.Components.Views.Item
 * File: item.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Loading from '../common/loading';
import NodesView from './nodes.view';
import { useData } from '../../_providers/data.provider.client';
import CaptureView from './capture.view';
import CapturesView from './captures.view';
import ImageView from './image.view';
import LocationsView from './locations.view';
import Item from '../common/item';

/**
 * Data item (record) component.
 *
 * @public
 */

const ItemView = () => {

    const api = useData();
    const { model='', data={} } = api || {};
    const { dependents=[] } = data || {};

    // view components indexed by model type
    const itemViews = {
        modern_visits: () => <LocationsView data={dependents} model={model} dependent={'modern_captures'} />,
        historic_visits: () => <LocationsView data={[data]} model={model} dependent={'historic_captures'} />,
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
