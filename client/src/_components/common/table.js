/*!
 * MLP.Client.Components.Common.Table
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Loading from './loading';

/**
 * Render table header.
 *
 * @public
 * @param { rows }
 * @return {React.Component}
 */

const TableHeader = ({ cols }) => {
    return <thead>
        <tr>
            {
                cols.map((col, index) => <th key={index}>{col}</th>)
            }
        </tr>
    </thead>
}

/**
 * Render table body.
 *
 * @public
 * @param {Array} rows
 * @param cols
 * @return {React.Component}
 */

const TableBody = ({rows, cols}) => {
    console.log('Table rows/cols:', rows, cols)
    return <tbody>{
            rows.map(({item}, index) => {
                return (
                    <tr key={index}>
                        {
                            // filter column values not defined in column array
                            Object.keys(item)
                                .filter(key => cols.includes(key))
                                .map((key, index) => {
                                return (<td key={index}>{item[key]}</td>);
                            })
                        }
                    </tr>
                );
            })
    }</tbody>
}

/**
 * Render table component.
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @return {React.Component}
 */

const Table = ({ rows, cols }) => {

    // ensure data has been retrieved
    return Array.isArray(rows) && Array.isArray(cols)
        ?
            <table>
                <TableHeader cols={cols} />
                <TableBody rows={rows} cols={cols} />
            </table>
        :
            <Loading/>
}

export default Table
