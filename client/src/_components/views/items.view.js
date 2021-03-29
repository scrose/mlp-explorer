/*!
 * MLP.Client.Components.Common.ItemsView
 * File: items.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import { sanitize } from '../../_utils/data.utils.client';
import Table from '../common/table';
import NodeMenu from '../menus/node.menu';

/**
 * Render item table component.
 *
 * @public
 * @param {String} model
 * @param {Object} items
 * @return {JSX.Element}
 */

const ItemsView = ({
                      model,
                      items=[],
                      menu=false
}) => {

    const nodeMenu = (id, metadata) => {
        return <NodeMenu
            model={model}
            id={id}
            label={`${getModelLabel(model)} Metadata`}
            metadata={metadata}
        />
    }

    // generate main schema
    const { fieldsets=[] }  = genSchema('show', model);

    // prepare data for items table columns
    const filterCols = () => {
        return fieldsets.reduce((cols, fieldset) => {
            const { fields=[] }  = fieldset || [];
            Object.keys(fields).reduce((cols, key) => {
                // get settings from schema (if exist)
                const { label='', render='', name='' } = fields[key] || {};
                cols.push({
                    name: name,
                    label: label,
                    render: render,
                    class: ''
                });
                return cols;
                }, cols)
            return cols;
        }, []);
    };

    // prepare data for items table rows
    const filterRows = () => {
        const cols = filterCols();
        return items.map(item => {
            return cols.reduce((o, col) => {
                o[col.name] = sanitize(
                    item.hasOwnProperty(col.name)
                        ? item[col.name] : '',
                    col.render);
                return o;
            }, {})
        });
    };

    console.log(filterCols(), filterRows())

    return <Table rows={filterRows()} cols={filterCols()} className={'item'} />

}

export default ItemsView
