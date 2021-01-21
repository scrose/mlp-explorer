/*!
 * MLP.Client.Components.Common.HorzTable
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


    // filter item values not defined in column array
    // - use column names as keys
    // - check any reserved keys for inclusion
    const filterItem = (key) => {
        return cols
                .map(cols => cols.name)
                .includes(key)
            || reserved.includes(key)
    }

    // Apply data processing based on schema
    const filterData = (item, key) => {
        const url = '';

        return <Data render={renderSettings[key]} value={item[key]} href={url} />
    }

    return <tbody>{
            rows.map((item, index) => {
                return (
                    <tr key={index}>
                        {
                            Object.keys(item)
                                .filter(filterItem)
                                .map((key, index) => {
                                return <td key={index}>{filterData(item, key)}</td>;
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
 * @param {String} orientation
 * @return {JSX.Element}
 */

const HorzTable = ({ rows, cols, classname=''}) => {

    console.log('HorzTable for users:', rows, cols)

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

export default HorzTable
