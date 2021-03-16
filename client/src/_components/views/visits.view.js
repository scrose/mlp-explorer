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
import Item from '../common/item';

/**
 * Model view component.
 *
 * @public
 * @param model
 * @param {Array} data
 * @return {JSX.Element}
 */

const VisitsView = ({ model, data }) => {

    const {node={}, metadata={}, dependents=[], hasDependents=false } = data || {};
    const {id='', type=''} = node || {};
    const { location_identity='' } = metadata || {};

    return (
        model === 'historic_visits'
            ? <Accordion
                key={id}
                type={type}
                label={location_identity}
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

            // apply location views for modern visits
            : <>
                <Accordion
                    type={'info'}
                    label={`${getModelLabel(model)} Metadata`}
                >
                    <Item model={type} metadata={metadata} />
                </Accordion>
                {
                    dependents.map((location, index) => {
                        return <NodesView
                            key={`location_${index}`}
                            model={'locations'}
                            data={location}/>;
                        })
                }
                </>
    )

}

export default VisitsView;
