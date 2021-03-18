/*!
 * MLP.Client.Components.Views.Locations
 * File: locations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import NodeMenu from '../menus/node.menu';
import CapturesView from './captures.view';

/**
 * Model view component.
 *
 * @public
 * @param {Array} data
 * @return {JSX.Element}
 */

const LocationsView = ({data}) => {

    const {node={}, metadata={}, dependents=[], hasDependents=false } = data || {};
    const {id='', type=''} = node || {};
    const { location_identity='' } = metadata || {};

    return <Accordion
        key={id}
        id={id}
        type={type}
        label={`Location ${location_identity}`}
        open={true}
        hasDependents={hasDependents}
        menu={
            <NodeMenu
                model={type}
                id={id}
                metadata={metadata}
                dependent={'modern_captures'}
            />
        }>
        <CapturesView captures={dependents} fileType={'modern_images'} />
    </Accordion>
}

export default LocationsView;
