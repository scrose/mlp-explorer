/*!
 * MLP.Client.Components.Views.Stations
 * File: stations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MetadataView, { MetadataAttached } from './metadata.view';
import Accordion from '../common/accordion';
import NodesView from './nodes.view';
import EditorMenu from '../menus/editor.menu';
import { getDependentTypes } from '../../_services/schema.services.client';

/**
 * Stations view component.
 *
 * @public
 * @param {Object} data
 * @return {JSX.Element}
 */

const StationsView = ({ data }) => {

    const { dependents = [], node = {}, metadata = {}, attached = {} } = data || {};
    const { id = '' } = node || {};

    return (
        <>
            <Accordion
                key={`md_${id}`}
                type={'info'}
                label={`Station Info`}
                open={false}>
                <MetadataView model={'stations'} metadata={metadata} />
                <MetadataAttached owner={node} attached={attached} />
            </Accordion>
            {
                (dependents || []).map(dependent => {

                    const { node = {}, metadata = {}, hasDependents = false, label = '' } = dependent || {};
                    const { id = '', type = '' } = node || {};
                    const isCapture = type === 'historic_captures' || type === 'modern_captures';

                    return !isCapture && <div key={id}>
                            {
                                type === 'modern_visits'
                                    ? <Accordion
                                        id={id}
                                        type={type}
                                        open={true}
                                        label={label}
                                        hasDependents={hasDependents}
                                        menu={
                                            <EditorMenu
                                                model={type}
                                                id={id}
                                                metadata={metadata}
                                                label={label}
                                                dependents={getDependentTypes(type)}
                                            />}>
                                        <NodesView model={type} data={dependent} />
                                    </Accordion>
                                    : <NodesView key={id} model={type} data={dependent} />
                            }
                    </div>;
                })
            }
        </>
    );
};

export default StationsView;
