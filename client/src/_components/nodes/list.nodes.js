/*!
 * MLP.Client.Components.User.List
 * File: list.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Loading from '../common/loading';
import Table from '../common/table';
import ItemMenu from '../menus/item.menu';
import Data from '../common/data';
import { useUser } from '../../_providers/user.provider.client';


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

    console.log('Nodes:', rows, cols)

    const user = useUser();

    // prepare row data for table
    const filterRows = () => {
        return rows
            .map(item => {

                // append inline edit menu (authenticated)
                if (user)
                    item.editor = <ItemMenu id={item.nodes_id} model={model} />;

                // set render option for item fields
                // returns row object indexed by field name
                return Object.keys(item).reduce((o, key) => {
                    const url = '';
                    const renderSetting = cols
                        .filter(col => key === col.name).render;
                    o[key] = <Data render={renderSetting} value={item[key]} href={url}/>
                    return o;
                }, {})
            });
    }

    // prepare column data for table
    const filterCols = () => {

        // omit hidden elements
        const fCols = cols
            .filter(col => col.render !== 'hidden')

        // include column heading for editor item tools (authenticated)
        if (user)
            fCols.push({name: 'editor', label: 'Edit'})

        return fCols;
    }

    return Array.isArray(rows) && Array.isArray(cols)
        ?
        <Table rows={ filterRows() } cols={ filterCols() } classname={'items'} />
        :
        <Loading/>

}

export default ListNodes;
