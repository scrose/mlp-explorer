/*!
 * MLP.Client.Components.Common.Heading
 * File: heading.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {
    getDependentTypes,
    getModelLabel,
    getStaticLabel, getStaticView,
    getViewLabel,
} from '../../_services/schema.services.client';
import { useRouter } from '../../_providers/router.provider.client';
import { useData } from '../../_providers/data.provider.client';
import Badge from '../common/badge';
import EditorMenu from "./editor.menu";

/**
 * Render view heading component.
 *
 * @public
 */

const HeadingMenu = () => {

    const router = useRouter();
    const api = useData();
    const omitHeadings = ['imageToolkit'];

    // get possible heading labels
    const staticView = getStaticView(router.route);
    const staticLabel = getStaticLabel(router.route);
    const nodeLabel = api.label;
    const modelLabel = getModelLabel(api.model);

    // generate heading based on current model/view
    const genHeading = (pageTitle=false) => {

        // omit header for select pages
        if (omitHeadings.includes(staticView) && !pageTitle) return null;

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

        // set page header
        return headings.hasOwnProperty(api.view) ? headings[api.view] : '';
    }

    const headingText = genHeading();

    // get any file info
    const {filename=''} = api.file;

    return <div className={'heading h-menu'}>
        {
            // Page Header
            headingText &&
            <ul>
                {
                    api.model &&
                    <li>
                        <Badge
                            className={`node_type ${api.model}`}
                            icon={api.model}
                            title={modelLabel}
                            label={modelLabel}
                        />
                    </li>
                }
                <li><h3>{genHeading()}</h3></li>
                {
                    api.model && <li className={'push'}>
                        <EditorMenu
                            fileType={api.type}
                            filename={filename}
                            id={api.id}
                            model={api.model}
                            view={api.view}
                            metadata={api.metadata}
                            owner={api.owner}
                            dependents={getDependentTypes(api.model)}
                        />
                    </li>
                }
            </ul>
        }
    </div>
}

export default HeadingMenu;
