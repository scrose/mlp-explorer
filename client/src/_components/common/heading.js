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

const Heading = ({node={}, model='', prefix=''}) => {

    const api = useRouter();
    const isNode = Object.keys(node).length > 0;

    // heading text/prefix attribute overrides computed heading
    const heading = isNode
        ? getNodeLabel(node)
        : getStaticLabel(api.route)
            ? getStaticLabel(api.route)
            : getModelLabel(model)

    prefix = isNode ? getModelLabel(node.type) : prefix;

    return  <h3>{prefix ? `${capitalize(prefix)}: ` : ''}{heading}</h3>
}

export default Heading;
