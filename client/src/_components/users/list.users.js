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
import { useUser } from '../../_providers/user.provider.client';
import Data from '../common/data';

/**
 * User list component to view/edit/delete records.
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @return {JSX.Element}
 */

const ListUsers = ({ rows=[], cols=[] }) => {

    console.log('Users:', rows, cols)

    const user = useUser();

    // rename value from indexed options
    const renameOption = (row, cols, key) => {
        const optKey = row[key];
        let label = optKey;
        cols
            .filter(col => col.name === key)
            .filter(col => col.hasOwnProperty('options'))
            .filter(col => col.options
                .filter(opt => opt.name === optKey)
                .map(opt => {label = opt.label})
            )
        return label;
    }

    // prepare row data for table
    const filterRows = () => {
        return rows
            .map(row => {

                // append inline edit menu (if authenticated)
                // disallow super-administrator account updates
                if (user)
                    row.editor = <ItemMenu id={row.user_id} model={'users'} />;

                // convert user role ID to label
                row.role = renameOption(row, cols, 'role');

                // set render option for item fields
                // returns row object indexed by field name
                return Object.keys(row).reduce((o, key) => {
                    const url = '';
                    const renderSetting = cols
                        .filter(col => key === col.name).render;
                    o[key] = <Data key={`_${key}`} render={renderSetting} value={row[key]} href={url}/>
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

export default ListUsers;
