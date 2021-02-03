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

const Heading = ({node={}, prefix=''}) => {

    const api = useRouter();
    console.log('Heading:', node, api.route)

    // heading text/prefix attribute overrides computed heading
    const heading = Object.keys(node).length > 0 ? getNodeLabel(node) : getStaticLabel(api.route);
    prefix = node ? getModelLabel(node.type) : prefix;

    return  <h3>{prefix ? `${capitalize(prefix)}: ` : ''}{heading}</h3>
}

export default Heading;
