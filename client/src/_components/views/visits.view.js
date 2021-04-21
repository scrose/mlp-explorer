/*!
 * MLP.Client.Components.Views.Visits
 * File: visits.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import CapturesView from './captures.view';
import NodesView from './nodes.view';
import { getDependentTypes, getModelLabel } from '../../_services/schema.services.client';
import MetadataView, { MetadataAttached } from './metadata.view';
import EditorMenu from '../menus/editor.menu';
import { useData } from '../../_providers/data.provider.client';
import { groupBy } from '../../_utils/data.utils.client';

/**
 * Model view component.
 *
 * @public
 * @param model
 * @param {Array} data
 * @return {JSX.Element}
 */

const VisitsView = ({ model, data }) => {

    const api = useData();
    const {
        id,
        type,
        owner,
        node,
        label,
        metadata,
        dependents,
        hasDependents,
        attached} = api.destructure(data) || {};
    const hasCaptures = type === 'historic_captures' || type === 'modern_captures';

    // filter dependents by type
    const captures = (dependents || []).filter(dependent => dependent.node.type === 'modern_captures');
    const locations = (dependents || []).filter(dependent => dependent.node.type === 'locations');

    return !hasCaptures && <>
        {
            model === 'historic_visits'
                ? <>
                    <Accordion
                        key={id}
                        id={id}
                        type={type}
                        label={'Historic Visit'}
                        open={true}
                        hasDependents={hasDependents}
                        menu={
                            <EditorMenu
                                model={type}
                                id={id}
                                label={label}
                                owner={owner}
                                metadata={metadata}
                                dependents={getDependentTypes(model)}
                            />
                        }>
                        <CapturesView captures={dependents} fileType={'historic_images'} />
                    </Accordion>
                    <MetadataAttached owner={node} attached={attached} />
                </>

                // apply location views for modern visits
                : <>
                    <Accordion
                        type={'info'}
                        label={`${getModelLabel(model)} Field Notes`}
                    >
                        <MetadataView model={type} metadata={metadata} />
                    </Accordion>
                    <MetadataAttached owner={node} attached={attached} />
                    {
                        locations
                            .map((dependent, index) => {
                                return <NodesView
                                    key={`visit_dependent_${index}`}
                                    model={'locations'}
                                    data={dependent} />;
                            })
                    }
                    <Accordion
                        type={'unsorted_captures'}
                        label={`Unsorted Captures`}
                    >
                        <CapturesView captures={captures} fileType={'modern_images'} />
                    </Accordion>
                </>
        }
    </>;
};

export default VisitsView;
