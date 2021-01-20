/*!
 * MLP.Client.Components.User.List
 * File: list.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Loading from '../common/loading';
import { getRoot } from '../../_utils/paths.utils.client';
import Table from '../common/table';
import Icon from '../common/icon';

/**
 * Inline menu component to edit records.
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @return {JSX.Element}
 */

const ItemEditMenu = ({id, model}) => {
    return (
        <div className={"menu"}>
            <ul>
                <li>
                    <a title={`View ${model}.`} href={`${getRoot()}/${model}/${id}`}>
                        <Icon type={"info"} />
                    </a>
                </li>
                <li>
                    <a title={`Edit ${model} data.`} href={`${getRoot()}/${model}/${id}/edit`}>
                        <Icon type={"edit"} />
                    </a>
                </li>
                <li>
                    <a title={`Delete ${model} record.`} href={`${getRoot()}/${model}/${id}/remove`}>
                        <Icon type={"delete"} />
                    </a>
                </li>
            </ul>
        </div>
    )
}

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
                item.editor = <ItemEditMenu id={item.user_id} model={'users'} />;
                return item;
            });
    }

    // omit hidden fields from rendering
    const filterCols = () => {
        return cols.filter(col => col.render !== 'hidden');
    }

    return Array.isArray(rows) && Array.isArray(cols)
        ?
        <Table rows={ filterRows() } cols={ filterCols() } classname={'records'} />
        :
        <Loading/>

}

export default ListUsers;
