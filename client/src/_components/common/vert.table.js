/*!
 * MLP.Client.Components.Common.HorzTable
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

const TableHeader = ({ headings }) => {
    return  <thead>
                <tr>
                    {
                        headings.map((col, index) => <th key={index}>{col.label}</th>)
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
    return <tbody>{
        rows.map((item, index) => {
            return (<tr key={index}>
                    <th key={index}>{cols[item.name]}</th>
                    <td key={index}>{item}</td>
                </tr>
            );
        })
    }</tbody>
}

/**
 * Render vertical table component. Inserts a row header
 * at the start of the row with the item field label.
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @param {String} classname
 * @return {JSX.Element}
 */

const VertTable = ({ rows, cols, classname=''}) => {

    // ensure data has been retrieved
    return Array.isArray(rows) && Array.isArray(cols)
        ?
            <table className={classname}>
                <TableHeader headings={[]} />
                <TableBody rows={rows} cols={cols} />
            </table>
        :
            <Loading/>
}

export default VertTable
