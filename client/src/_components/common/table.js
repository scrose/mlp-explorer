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
 * @param tableID
 * @param { rows }
 * @return {JSX.Element}
 */

const TableHeader = ({ tableID, cols }) => {
    return  <thead>
                <tr>
                    {
                        cols.map((col, index) =>
                            <th
                                key={`${tableID}_col_${index}`}
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
 * @param tableID
 * @param {Array} rows: [{name: DATA}]
 * @param {Array} cols: [{name: NAME, label: DATA}]
 * @return {JSX.Element}
 */

const TableBody = ({tableID, rows, cols}) => {
    return <tbody>{
            rows.map((row, index) => {
                return (
                    <tr key={`${tableID}_row_${index}`}>
                        {
                            cols
                                .filter(col => row.hasOwnProperty(col.name))
                                .map(col =>
                                    <td
                                        key={`td_${col.name}`}
                                        className={col.name}>
                                        {row[col.name]}
                                    </td>
                                )
                        }
                    </tr>
                );
            })
    }</tbody>
}

/**
 * Render table component.
 * - Input columns (cols) must be object of form:
 *   [...{name: <column name>, label: <column label>}]
 * - Input rows (rows) must be object of form:
 *   [...{[name]: {...[column name]: <row data>}]
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @param {String} classname (Optional)
 * @return {JSX.Element}
 */

const Table = ({ rows, cols, className=''}) => {

    // generate unique ID value for table
    const tableID = Math.random().toString(16).substring(2);

    // ensure data has been retrieved
    return Array.isArray(rows) && Array.isArray(cols)
        ?
            <table className={className}>
                <TableHeader tableID={tableID} cols={cols} />
                <TableBody tableID={tableID} rows={rows} cols={cols} />
            </table>
        :
            <Loading/>
}

export default Table
