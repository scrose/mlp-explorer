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
 * @public
 */

const List = ({ items }) => {
    return (
        <ul>
            {items.map((item, index) => {
                return (<li key={index}>{item}</li>)
            })}
        </ul>
    )
}

export default List;
