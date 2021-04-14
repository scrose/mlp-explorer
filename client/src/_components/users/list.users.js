/*!
 * MLP.Client.Components.User.List
 * File: list.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Table from '../common/table';
import { useUser } from '../../_providers/user.provider.client';
import { genSchema } from '../../_services/schema.services.client';
import { sanitize } from '../../_utils/data.utils.client';
import Loading from '../common/icon';

/**
 * User list component to view/edit/delete records.
 *
 * @public
 * @param {Array} data
 * @return {JSX.Element}
 */

const ListUsers = ({ data=[]}) => {

    const { fields=[] } = genSchema('list', 'users');
    const user = useUser();

    // rename value from indexed options
    const renameOption = (row, cols, key) => {
        const optKey = row[key];
        let label = optKey;
        fields
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
        return data
            .map(row => {

                // append inline edit menu (if authenticated)
                // disallow super-administrator account updates
                if (user)
                    row.editor = '';

                // convert user role ID to label
                row.role = renameOption(row, fields, 'role');

                // set render option for item fields
                // returns row object indexed by field name
                return Object.keys(row).reduce((o, key) => {
                    const renderSetting = fields
                        .filter(col => key === col.name).render;
                    o[key] = sanitize(row[key], renderSetting)
                    return o;
                }, {})
            });
    }

    // prepare column data for table
    const filterCols = () => {

        // omit hidden elements
        const fCols = fields
            .filter(col => col.render !== 'hidden')

        // include column heading for editor item tools (authenticated)
        if (user)
            fCols.push({name: 'editor', label: 'Edit'})

        return fCols;
    }

    return Array.isArray(data) && Array.isArray(fields)
        ?
        <Table rows={ filterRows() } cols={ filterCols() } classname={'items'} />
        :
        <Loading/>

}

export default ListUsers;
