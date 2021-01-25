/*!
 * MLP.Client.Components.Common.Item
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Loading from './loading';
import { getField } from '../../_services/schema.services.client';
import ItemMenu from '../menus/item.menu';
import Data from './data';

/**
 * Render item table body.
 *
 * @public
 * @return {JSX.Element}
 */

const TableBody = ({values, fields}) => {
    return <tbody>
        {
            fields.map((field, index) => {
                return (
                    <tr key={`tr_${ index }`}>
                        <th key={`th_${ index }`} className={field.class}>{field.label}</th>
                        <td key={`td_${ index }`}>{values[field.name]}</td>
                    </tr>
                )
            })
        }
    </tbody>
}

/**
 * Data item (record) component.
 *
 * @public
 * @param { values, fields }
 */

const Item = ({ values, fields }) => {

    // prepare column data for table
    // - omit hidden elements
    const filterFields = () => {
        return fields
            .filter(col => col.render !== 'hidden')
            .map(col => {col.class=''; return col})
    }

    return values && Array.isArray(fields)
        ?
        <table className={'item'}>
            <TableBody values={ values } fields={ filterFields() } />
        </table>
        :
        <Loading/>
}

export default Item;
