/*!
 * MLP.Client.Components.Nodes.List
 * File: list.nodes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Loading from '../common/loading';
import ItemMenu from '../menus/item.menu';
import ItemView from '../views/item.view';
import { labelKeys } from '../../_services/schema.services.client';


/**
 * User list component to view/edit/delete records.
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @param model
 * @return {JSX.Element}
 */

const ListNodes = ({ rows=[], cols=[], model='' }) => {

    // prepare column data for table
    // - omit hidden elements
    const filterCols = () => {
        return cols
            .filter(col => col.render !== 'hidden')
            .map(col => {col.class=''; return col})
    }

    // prepare item data for list
    // - set render option for each item data field
    // - return complete node item for each list element
    const filterItems = () => {
        return rows.map((row, index) => {
            console.log(row)
            const fields = filterCols();
            const itemData = Object.keys(fields).reduce((o, key) => {
                const url = '';
                const renderSetting = fields[key].render;
                const fieldName = fields[key].name;
                o[fieldName] = {
                    render: renderSetting,
                    value: row[fieldName],
                    href: url
                };
                return o;
            }, {})
            return (
                <div key={`node_${row.nodes_id}`} className={'node'}>
                    <span>{index + 1}</span>
                        {
                            <ItemMenu id={row.nodes_id} model={model} />
                        }
                    <div className={'collapsible'}>
                        <ItemView data={itemData} fields={fields} />
                    </div>
                </div>
            )
        });
    }

    return Array.isArray(rows) && Array.isArray(cols)
        ? <ul className={'items'}>
            {
                filterItems().map((item, index) => {
                        return (<li key={`item_${index}`}>{item}</li>)
                })
            }
          </ul>
        : <Loading/>

}

export default ListNodes;