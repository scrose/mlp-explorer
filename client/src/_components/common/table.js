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

const TableHeader = ({ headings }) => {
    console.log(headings)
    return <thead>
        <tr>
        {
            Object.keys(headings).map((key, index) => {
                return <th key={index}>{key}</th>
            })
        }
        </tr>
    </thead>
}

/**
 * Render table body.
 *
 * @public
 * @param { rows }
 * @return {React.Component}
 */

const TableBody = ({ rows }) => {
    return <tbody>{
        rows.map(({item}, index) => {
            console.log('Item:', item)
            return (
                <tr key={index}>
                    {
                        // iterate over row columns
                        Object.values(item).map((val, index) => {
                            return (<td key={index}>val</td>);
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
 * @param { rows }
 * @return {React.Component}
 */

const Table = ({ rows, cols }) => {

    // get column attributes
    const { attributes=null } = cols || {};
    console.log('Rows:', rows)

    // ensure data has been retrieved
    return rows && cols
        ?
            <table>
                <TableHeader headings={attributes}/>
                <TableBody rows={rows}/>
            </table>
        :
            <Loading/>
}

export default Table
