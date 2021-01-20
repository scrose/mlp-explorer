/*!
 * MLP.Client.Components.User.List
 * File: list.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import Loading from '../common/loading';
import { genSchema } from '../../_services/schema.services.client';
import { useUser } from '../../_providers/user.provider.client';
import { useAuth } from '../../_providers/auth.provider.client';
import { getURL, redirect } from '../../_utils/paths.utils.client';
import { addMsg } from '../../_services/session.services.client';
import Table from '../common/table';
import Icon from '../common/icon';

/**
 * Inline menu component to edit records.
 *
 * @public
 * @param { rows }
 * @return {React.Component}
 */

const ItemEditMenu = ({id, model}) => {
    return (
        <ul>
            <li>
                <a title={`View ${model}.`} href={`${getURL()}/${model}/${id}`}>
                    <Icon type={"home"} />
                </a>
            </li>
            <li>
                <a title={`Edit ${model} data.`} href={`${getURL()}/${model}/${id}/edit`}>
                    <Icon type={"home"} />
                </a>
            </li>
            <li>
                <a title={`Delete ${model} record.`} href={`${getURL()}/${model}/${id}/remove`}>
                    <Icon type={"home"} />
                </a>
            </li>
        </ul>
    )
}

const ListUsers = ({rows, cols}) => {

    // prepare row data for listing
    const filterRows = () => {
        // apply user data filters:
        // - append editor functionality to each row
        return rows
            .map(({item}, index) => {

            // append inline edit menu
            item.editor = <ItemEditMenu id={item.user_id} model={'users'} />;

            return {item};
        });
    }

    // prepare column data for listing
    const filterCols = () => {
        // apply user data filters:
        // - omit hidden fields from rendering
        return cols.filter(col => col.render !== 'hidden');
    }

    return Array.isArray(rows) && Array.isArray(rows)
        ?
        <Table rows={filterRows()} cols={filterCols()} />
        :
        <Loading/>

}

export default ListUsers;
