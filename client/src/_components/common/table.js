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
 * @return {JSX.Element}
 */

const TableHeader = ({ cols }) => {
    return  <thead>
                <tr>
                    {
                        cols.map((col, index) => <th key={index}>{col.label}</th>)
                    }
                </tr>
            </thead>
}

/**
 * Render table body.
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @return {JSX.Element}
 */

const TableBody = ({rows, cols}) => {
    const reserved = ['editor'];
    return <tbody>{
            rows.map((item, index) => {
                return (
                    <tr key={index}>
                        {
                            // filter item values not defined in column array
                            // - use column names as keys
                            // - check any reserved keys for inclusion
                            Object.keys(item)
                                .filter(key => cols
                                    .map(cols => cols.name)
                                    .includes(key) || reserved.includes(key)
                                )
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
 * @param {String} classname
 * @return {JSX.Element}
 */

const Table = ({ rows, cols, classname=''}) => {

    console.log('Table for users:', rows, cols)

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
