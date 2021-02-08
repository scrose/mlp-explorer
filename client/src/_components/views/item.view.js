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

/**
 * Data item (record) component.
 *
 * @public
 */

const ItemView = () => {

    const api = useData();
    const { model='', data=null } = api || {};

    // view components indexed by model type
    const itemViews = {
        default: () => <NodesView data={ data } model={model} />
    }

    return Object.keys(data).length > 0
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
