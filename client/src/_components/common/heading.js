/*!
 * MLP.Client.Components.Common.Heading
 * File: heading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {
    getModelLabel,
    getStaticLabel, getStaticView,
    getViewLabel,
} from '../../_services/schema.services.client';
import { useRouter } from '../../_providers/router.provider.client';
import { useData } from '../../_providers/data.provider.client';
import Badge from './badge';

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
    const nodeLabel = api.label;
    const modelLabel = getModelLabel(api.model);

    // select icon type
    const icon = api.model ? api.model : api.view ? api.view : getStaticView(router.route);

    // generate heading based on current model/view
    const genHeading = () => {

        // use static label (if exists)
        if (staticLabel) return staticLabel;

        const headings = {
            notFound: getStaticLabel('/not_found'),
            404: 'Not Found',
            show: nodeLabel,
            new: `${getViewLabel('new')}: ${modelLabel}`,
            edit: `${getViewLabel('edit')}: ${nodeLabel}`,
            filter: `${getViewLabel('filter')} Stations`,
            import: `${getViewLabel('import')}: ${getModelLabel(api.model, 'label')}`,
            default: `${getViewLabel(api.view)}: ${modelLabel}`
        }
        return headings.hasOwnProperty(api.view) &&
            <>
                {
                    headings[api.view]
                }
            </>
    }

    const headingText = genHeading();

    return headingText && <div className={'heading h-menu'}>
        <ul>
            <li><h3>{headingText}</h3></li>
            {
                api.model &&
                <li className={'push'}>
                    <Badge
                        className={api.model}
                        icon={api.model}
                        title={modelLabel}
                        label={modelLabel}

                    />
                </li>
            }
        </ul>
    </div>
}

export default Heading;
