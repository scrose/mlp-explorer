/*!
 * MLP.Client.Components.Common.List
 * File: list.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * List component.
 *
 * @param {Array} items
 * @param {String} classname
 * @public
 */

const List = ({ items, classname='' }) => {
    return (
        <ul className={classname}>
            {
                Array.isArray(items) && items.length > 0
                    ? items.map((item, index) => {
                        return (<li key={index}>{item}</li>)})
                    : <li key={0}>{''}</li>
            }
        </ul>
    )
}

export default List;
