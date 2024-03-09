/*!
 * MLE.Client.Components.Common.Table
 * File: editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Loading from './loading';
import Icon from "./icon";

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
    const noop = ()=>{};
    return <tbody>{
        rows.map((row, index) => {
            return (
                <tr key={`${tableID}_row_${index}`} onClick={row.onClick || noop}>
                    {
                        cols
                            .filter(col => row.hasOwnProperty(col.name))
                            .map(col =>
                                <td
                                    key={`td_${index}_${col.name}`}
                                    className={row.className}>
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
 * @param {String} className (Optional)
 * @return {JSX.Element}
 */

const Table = ({ rows, cols, className=''}) => {

    // generate unique ID value for table
    const tableID = Math.random().toString(16).substring(2);

    // determine default sort field
    const defaultSort = cols.filter(({defaultSort}) => !!defaultSort).map(({name}) => name).join();
    const [sortBy, setSortBy] = React.useState(defaultSort);
    const [order, setOrder] = React.useState(1);

    function _selectSort(col) {
        console.log(col)
        setSortBy(col);
        setOrder(-order);
    }

    function _compareFn(a, b) {
        // ensure field value can be sorted by selected column name
        if (!a.hasOwnProperty(sortBy) || !a.hasOwnProperty(sortBy)) return 0;
        const nameA = String(a[sortBy]).toLowerCase(); // ignore upper and lowercase
        const nameB = String(b[sortBy]).toLowerCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -order;
        }
        if (nameA > nameB) {
            return order;
        }

        // names must be equal
        return 0;
    }

    // ensure data has been retrieved
    return Array.isArray(rows) && Array.isArray(cols)
        ?
        <table className={className}>
            <thead>
            <tr>
                {
                    cols.map((col, index) =>
                        <th
                            key={`${tableID}_col_${index}`}
                            className={col.className}
                            onClick={() => {_selectSort(col.name)}}
                        >
                            <div className={'h-menu'} style={{cursor: 'pointer'}}>
                                <ul>
                                    <li>{col.label}</li>
                                    <li className={'push'} style={{visibility: `${col.name === sortBy ? 'visible' : 'hidden'}`}}>
                                        <Icon type={order === 1 ? 'up' : 'down'}/>
                                    </li>
                                </ul>
                            </div>
                        </th>)
                }
            </tr>
            </thead>
            <TableBody tableID={tableID} rows={rows.sort(_compareFn)} cols={cols} />
        </table>
        :
        <Loading/>
}

export default Table
