/*!
 * MLP.Client.Components.Common.Heading
 * File: heading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getModelLabel, getNodeLabel, getStaticLabel } from '../../_services/schema.services.client';
import { capitalize } from '../../_utils/data.utils.client';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Render view heading component.
 *
 * @public
 */

const Heading = ({path='', prefix=''}) => {

    // check if node path available to extract view label
    const isNode = path && Object.keys(path).length > 0 && typeof path === 'object';
    const api = useRouter();

    // extract root path from node path data
    const rootNode = Object.keys(path || {})
        .filter(key => key === '0')
        .reduce((o, key) => {
            return path[key]
        }, {});

    // heading text/prefix attribute overrides computed heading
    const heading = isNode ? getNodeLabel(rootNode) : getStaticLabel(api.route);
    prefix = isNode ? getModelLabel(rootNode.type) : prefix;

    return <h3>{prefix ? `${capitalize(prefix)}: ` : ''}{heading}</h3>
}

export default Heading;
