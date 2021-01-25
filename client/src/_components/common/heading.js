/*!
 * MLP.Client.Components.Common.Heading
 * File: heading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getPageHeading } from '../../_services/schema.services.client';
import { capitalize } from '../../_utils/data.utils.client';

/**
 * Render view heading component.
 *
 * @public
 */

const Heading = ({path='', prefix='', text = ''}) => {

    // filter root path from node path data
    const rootPathData = Object.keys(path)
        .filter(key => key === '0')
        .reduce((o, key) => {
            return path[key]
        }, {})

    // text attribute overrides computed heading
    const heading = path && typeof path === 'object'
        ? getPageHeading(rootPathData)
        : path;

    return <h3>{prefix ? `${capitalize(prefix)}:` : ''}{text ? text : heading}</h3>
}

export default Heading;
