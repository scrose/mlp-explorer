/*!
 * MLP.Client.Components.Common.Table
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Loading from './loading';
import Data from './data';

/**
 * Render table header.
 *
 * @public
 * @param { rows }
 * @return {JSX.Element}
 */

const TableHeader = ({ cols }) => {
    return  <thead>
                <tr>
                    {
                        cols.map((col, index) =>
                            <th
                                key={index}
                                className={col.class}
                            >
                                {col.label}
                            </th>)
                    }
                </tr>
            </thead>
}

/**
 * Render table body. Filters item values not defined in
 * column array using column/item names as keys.
 *
 * @public
 * @param {Array} rows: [{name: NAME, data: DATA}]
 * @param {Array} cols: [{name: NAME, label: DATA}]
 * @return {JSX.Element}
 */

const TableBody = ({rows, cols}) => {

    return <tbody>{
            rows.map((row, index) => {
                return (
                    <tr key={index}>
                        {
                            cols
                                .filter(col => row.hasOwnProperty(col.name))
                                .map((col, index) =>
                                    <td key={index}>{row[col.name]}</td>
                                )
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
 * @param {String} classname (Optional)
 * @return {JSX.Element}
 */

const Table = ({ rows, cols, classname=''}) => {

    // console.log('Table Input:', rows, cols)

    // ensure data has been retrieved
    return Array.isArray(rows) && Array.isArray(cols)
        ?
            <table className={classname}>
                <TableHeader cols={cols} />
                <TableBody rows={rows} cols={cols} />
            </table>
        :
            <Loading/>
}

export default Table
