/*!
 * MLP.Client.Components.Common.Heading
 * File: heading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {
    getFileLabel,
    getModelLabel,
    getNodeLabel,
    getStaticLabel,
    getViewLabel,
} from '../../_services/schema.services.client';
import { useRouter } from '../../_providers/router.provider.client';
import { useData } from '../../_providers/data.provider.client';

/**
 * Render view heading component.
 *
 * @public
 */

const Heading = () => {

    const router = useRouter();
    const api = useData();

    // get possible heading labels
    const staticLabel = getStaticLabel(router.route);
    const nodeLabel = getNodeLabel(api.root);
    const modelLabel = getModelLabel(api.model);
    const fileLabel = getFileLabel(api.root)

    // generate heading based on current model/view
    const genHeading = () => {

        // return empty string if node and model not defined
        if (!modelLabel) {
            return '';
        }

        const headings = {
            add: `${getViewLabel('add')}: ${modelLabel}`,
            show: `${modelLabel !== nodeLabel ? modelLabel + ': ' : ''}${nodeLabel}`,
            import: `${getViewLabel('import')}: ${getModelLabel(api.model, 'label')}`,
            default: `${getViewLabel(api.view)}: ${modelLabel}`
        }
        return headings.hasOwnProperty(api.view)
            ? headings[api.view]
            : headings.default
    }

    return <h3>{ staticLabel ? staticLabel : genHeading()}</h3>
}

export default Heading;
