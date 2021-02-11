/*!
 * MLP.Client.Components.Common.Heading
 * File: heading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getModelLabel, getNodeLabel, getStaticLabel, getViewLabel } from '../../_services/schema.services.client';
import { capitalize } from '../../_utils/data.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { useData } from '../../_providers/data.provider.client';

/**
 * Render view heading component.
 *
 * @public
 */

const Heading = ({prefix=''}) => {

    const router = useRouter();
    const api = useData();

    // check that a root node exists in current path
    const isNode = Object.keys(api.root).length > 0;

    // heading text/prefix attribute overrides computed heading
    const heading = isNode
        ? getNodeLabel(api.root)
        : getStaticLabel(router.route)
            ? getStaticLabel(router.route)
            : getModelLabel(api.model)

    prefix = isNode ? getModelLabel(api.root.type) : prefix;

    return <h3>
        {api.view !== 'show' ? getViewLabel(api.view) + ': ' : ''}
        {
            prefix && prefix !== heading
                ? capitalize(prefix) + ': '
                : ''
        }
        {heading}
    </h3>
}

export default Heading;
