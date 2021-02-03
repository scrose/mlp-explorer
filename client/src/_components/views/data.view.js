/*!
 * MLP.Client.Components.Common.View.Data
 * File: data.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useRouter } from '../../_providers/router.provider.client';
import Form from '../common/form';
import ItemView from './item.view';
import Table from '../common/table';
import ListUsers from '../users/list.users';
import ListNodes from '../nodes/list.nodes';
import NotfoundError from '../error/notfound.error';
import Loading from '../common/loading';

/**
 * Build requested data view from API data.
 *
 * @param {String} model
 * @param {String} view
 * @param {String} render
 * @param {Object} data
 * @param {Function} setValues
 * @public
 */

const DataView = ({
                      view,
                      model,
                      data,
                      setData,
                      render
}) => {

    // select default callback for view
    const api = useRouter();
    const callback = api.post;

    // Extract initial form data (if exists)
    const initData = data.hasOwnProperty('data') ? data.data : [];

    // view components indexed by render type
    const renders = {
        form: () => (
            <Form
                view={view}
                model={model}
                data={initData}
                setData={setData}
                callback={callback}
            />),
        item: () => (
            <ItemView
                data={data || {}}
                view={view || ''}
                model={model || ''}
            />),
        list: () => (
            <Table
                rows={data || []}
                cols={[]}
            />),
        listUsers: () => (
            <ListUsers
                data={data || []}
            />),
        listNodes: () => (
            <ListNodes
                data={data || []}
                model={model}
            />),
        notFound: () => <NotfoundError />
    }

    // render data view
    return (
        <div className={'view'}>
            <div className={'data'}>
                {
                    renders.hasOwnProperty(render) ? renders[render]() : <Loading/>
                }
            </div>
        </div>
    )
}

export default DataView;
