/*!
 * MLP.Client.Components.Common.Item
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Loading from './loading';
import Data from './data';

/**
 * Render item table body.
 *
 * @public
 * @return {JSX.Element}
 */

const TableBody = ({data, fields}) => {
    return <tbody>
        {
            fields.map((field, index) => {
                return (
                    <tr key={`tr_${ index }`}>
                        <th key={`h_${ index }`} className={field.class}>{field.label}</th>
                        <td key={`d_${ index }`}>
                            <Data
                                key={`d_${ index }`}
                                render={data[field.name].render}
                                value={data[field.name].value}
                                href={data[field.name].url}
                            />
                        </td>
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

const Item = ({ data, fields }) => {

    // prepare column data for table
    // - omit hidden elements
    const filterFields = () => {
        return fields
            .filter(col => col.render !== 'hidden')
            .map(col => {col.class=''; return col})
    }

    return data && Array.isArray(fields)
        ?
        <table className={'item'}>
            <TableBody data={ data } fields={ filterFields() } />
        </table>
        :
        <Loading/>
}

export default Item;
