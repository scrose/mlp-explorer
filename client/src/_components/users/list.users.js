/*!
 * MLP.Client.Components.User.List
 * File: list.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Loading from '../common/loading';
import HorzTable from '../common/horz.table';
import ItemMenu from '../menus/item.menu';

/**
 * User list component to view/edit/delete records.
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @return {JSX.Element}
 */

const ListUsers = ({ rows=[], cols=[] }) => {

    // append editor functionality to each row
    const filterRows = () => {
        return rows
            .map(item => {
                // append inline edit menu
                item.editor = <ItemMenu id={item.user_id} model={'users'} />;
                return item;
            });
    }

    // omit hidden fields from rendering
    const filterCols = () => {
        const fCols = cols.filter(col => col.render !== 'hidden')
        // include column heading for editor item tools
        fCols.push({name: 'editor', label: 'Edit'})
        return fCols;
    }

    return Array.isArray(rows) && Array.isArray(cols)
        ?
        <HorzTable rows={ filterRows() } cols={ filterCols() } classname={'items'} />
        :
        <Loading/>

}

export default ListUsers;
