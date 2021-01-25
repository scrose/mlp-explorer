/*!
 * MLP.Client.Components.Common.View.Data
 * File: data.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useData } from '../../_providers/data.provider.client';
import Heading from '../common/heading';
import Form from '../common/form';
import Item from '../common/item';
import Table from '../common/table';
import ListUsers from '../users/list.users';
import ListNodes from '../nodes/list.nodes';
import Notfound from '../error/notfound';
import Loading from '../common/loading';

/**
 * Build requested data view from API data.
 *
 * @param {String} route
 * @param {String} id
 * @param {String} view
 * @param {String} model
 * @param {String} render
 * @param {Object} values
 * @param {Function} setValues
 * @param {Object} schema
 * @public
 */

const DataView = ({
                      route,
                      id,
                      view,
                      model,
                      values,
                      setValues,
                      schema,
                      render
}) => {

    // select default callback for view
    const api = useData();
    const callback = api.post;

    // get settings from schema
    const { attributes={}, fields=[] } = schema || {};
    const { label='', method='POST', review='' } = attributes || {};

    // view components indexed by render type
    const renders = {
        'form': () => (
            <Form
                action={route}
                review={review}
                model={model}
                method={method}
                legend={label}
                submit={label}
                fields={fields}
                data={values}
                setData={setValues}
                callback={callback}
            />),
        'item': () => (
            <Item
                values={values || {}}
                fields={fields || []}
            />),
        'list': () => (
            <Table
                rows={values || []}
                cols={fields || []}
            />),
        'listUsers': () => (
            <ListUsers
                rows={values || []}
                cols={fields || []}
            />),
        'listNodes': () => (
            <ListNodes
                rows={values || []}
                cols={fields || []}
                model={model}
            />),
        'notFound': () => <Notfound />
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
