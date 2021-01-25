/*!
 * MLP.Client.Components.Nodes.List
 * File: list.nodes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Loading from '../common/loading';
import ItemMenu from '../menus/item.menu';
import Data from '../common/data';
import List from '../common/list';
import Item from '../common/item';
import { getLabelKeys } from '../../_services/schema.services.client';


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
            const fields = filterCols();
            const item = Object.keys(fields).reduce((o, key) => {
                const url = '';
                const renderSetting = fields[key].render;
                const fieldName = fields[key].name;
                o[fieldName] = <Data render={renderSetting} value={row[fieldName]} href={url} />;
                return o;
            }, {})
            return (
                <div className={'node'}>
                    <span>{index + 1} {model}</span>
                        {
                            <ItemMenu id={row.nodes_id} model={model} />
                        }
                    <div className={'collapsible'}>
                        <Item values={item} fields={fields} />
                    </div>
                </div>
            )
        });
    }

    return Array.isArray(rows) && Array.isArray(cols)
        ? <List items={ filterItems() } classname={'items'} />
        : <Loading/>

}

export default ListNodes;
