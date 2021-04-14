/*!
 * MLP.Client.Components.Views.Locations
 * File: locations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Accordion from '../common/accordion';
import CapturesView from './captures.view';
import MetadataView, { MetadataAttached } from './metadata.view';
import EditorMenu from '../menus/editor.menu';
import { getDependentTypes } from '../../_services/schema.services.client';

/**
 * Model view component.
 *
 * @public
 * @param {Array} data
 * @return {JSX.Element}
 */

const LocationsView = ({data}) => {

    const {node={}, metadata={}, dependents=[], hasDependents=false, attached={} } = data || {};
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
            <EditorMenu
                model={type}
                id={id}
                metadata={metadata}
                dependents={getDependentTypes('locations')}
            />
        }>
        <Accordion type={'info'} label={`Location Field Notes`}>
            <MetadataView key={`locations_${id}`} model={'locations'} metadata={metadata} />
        </Accordion>
        <MetadataAttached owner={node} attached={attached} />
        <CapturesView captures={dependents} fileType={'modern_images'} />
    </Accordion>
}

export default LocationsView;
