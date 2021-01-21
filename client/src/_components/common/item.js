/*!
 * MLP.Client.Components.Common.Item
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Loading from './loading';
import { getField } from '../../_services/schema.services.client';

/**
 * Render item table body.
 *
 * @public
 * @return {JSX.Element}
 */

const TableBody = ({values, fields}) => {
    console.log('Table:', values, fields)
    return <tbody>{
        Object.keys(values)
            .map((key, index) => {
            console.log(key, values[key])
            return (
                <tr key={`tr_${ index }`}>
                    <th key={`th_${ index }`}>{fields[key]}</th>
                    <td key={`td_${ index }`}>{values[key]}</td>
                </tr>
            );
        })
    }</tbody>
}

/**
 * Data item (record) component.
 *
 * @public
 * @param { values, fields }
 */

const Item = ({ values, fields }) => {
    console.log('Item:', values, fields)

    // omit hidden fields from rendering
    const filterFields = (field) => {
        const commonFields = getField(field.name);
        return field.render !== 'hidden'
            && commonFields.render !== 'hidden'
    }

    // convert fields array to item object
    const filterCols = () => {
        return fields
            .filter(filterFields)
            .reduce((o, field) => {
                o[field.name] = field.label;
                return o;
                }, {});
    }

    return values && Array.isArray(fields)
        ?
        <table className={'item'}>
            <TableBody values={values} fields={filterCols()} />
        </table>
        :
        <Loading/>
}

export default Item;
