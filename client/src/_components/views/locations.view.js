/*!
 * MLP.Client.Components.Views.Locations
 * File: locations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import NodeMenu from '../menus/node.menu';
import NodesView from './nodes.view';

/**
 * Model view component.
 *
 * @public
 * @param {String} model
 * @param {Array} locations
 * @param {String} model
 * @return {JSX.Element}
 */

const LocationsView = ({
                           model,
                           locations,
}) => {

    return (
        <>
            {
                locations.map(location => {
                    const {node={}, metadata={}, hasDependents=false } = location || {};
                    const {id='', type=''} = node || {};
                    const { location_identity='' } = metadata || {};

                    return (
                        <Accordion
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
                                    dependent={model}
                                />
                            }>
                                <NodesView data={location} model={model} />
                            </Accordion>
                    )
                })
            }
        </>
    )
}

export default LocationsView;
