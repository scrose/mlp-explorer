/*!
 * MLP.Client.Components.Views.Item
 * File: item.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Loading from '../common/loading';
import NodesView from './nodes.view';

/**
 * Data item (record) component.
 *
 * @public
 * @param { data, model }
 */

const ItemView = ({ data: apiData, view, model }) => {

    // view components indexed by model type
    const itemViews = {
        default: () => <NodesView data={ apiData } model={model} />
    }

    return Object.keys(apiData).length > 0
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
