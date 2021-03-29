/*!
 * MLP.Client.Components.Views.Visits
 * File: visits.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import NodeMenu from '../menus/node.menu';
import CapturesView from './captures.view';
import NodesView from './nodes.view';
import { getModelLabel } from '../../_services/schema.services.client';
import MetadataView, { MetadataAttached } from './metadata.view';

/**
 * Model view component.
 *
 * @public
 * @param model
 * @param {Array} data
 * @return {JSX.Element}
 */

const VisitsView = ({ model, data }) => {

    const { node = {}, metadata = {}, dependents = [], hasDependents = false, attached = {} } = data || {};
    const { id = '', type = '' } = node || {};

    return <>
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
                            <NodeMenu
                                model={type}
                                id={id}
                                metadata={metadata}
                                dependent={'historic_captures'}
                            />
                        }>
                        <CapturesView captures={dependents} fileType={'historic_images'} />
                    </Accordion>
                    <MetadataAttached attached={attached} />
                </>

                // apply location views for modern visits
                : <>
                    <Accordion
                        type={'info'}
                        label={`${getModelLabel(model)} Field Notes`}
                    >
                        <MetadataView model={type} metadata={metadata} />
                    </Accordion>
                    <MetadataAttached attached={attached} />
                    {
                        dependents.map((location, index) => {
                            return <NodesView
                                key={`location_${index}`}
                                model={'locations'}
                                data={location} />;
                        })
                    }
                </>
        }
    </>;
};

export default VisitsView;
