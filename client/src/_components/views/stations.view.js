/*!
 * MLP.Client.Components.Views.Stations
 * File: stations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MetadataView, { MetadataAttached } from './metadata.view';
import Accordion from '../common/accordion';
import NodeMenu from '../menus/node.menu';
import { getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import NodesView from './nodes.view';

/**
 * Stations view component.
 *
 * @public
 * @param {Object} data
 * @return {JSX.Element}
 */

const StationsView = ({data}) => {

    const {dependents=[], node={}, metadata={}, attached={}} = data || {};
    const {id=''} = node || {};

    return (
        <>
            <Accordion
                key={`md_${id}`}
                type={'info'}
                label={`Station Info`}
                open={false}>
                <MetadataView model={'stations'} metadata={metadata} />
                <MetadataAttached attached={attached} />
            </Accordion>
            {
                (dependents || []).map(dependent => {

                    const {node={}, metadata={}, hasDependents=false} = dependent || {};
                    const {id='', type=''} = node || {};
                    const label = getNodeLabel(dependent);

                    return (
                        type === 'modern_visits'
                            ? <Accordion
                                key={id}
                                id={id}
                                type={type}
                                open={true}
                                label={label}
                                hasDependents={hasDependents}
                                menu={
                                    <NodeMenu
                                        model={type}
                                        id={id}
                                        metadata={metadata}
                                        label={label}
                                        dependent={'locations'}
                                    />}
                            >
                                <NodesView model={type} data={dependent} />
                                </Accordion>
                            : <NodesView key={id} model={type} data={dependent} />
                    )
                })
            }
        </>
    )
}

export default StationsView;
