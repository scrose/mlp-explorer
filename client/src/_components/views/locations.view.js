/*!
 * MLP.Client.Components.Views.Locations
 * File: locations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import Accordion from '../common/accordion';
import ItemMenu from '../menus/item.menu';
import CapturesView from './captures.view';

/**
 * Model view component.
 *
 * @public
 * @param {Object} apiData
 * @param {Object} locations
 * @return {JSX.Element}
 */

const LocationsView = ({
                           model,
                           locations,
                           dependent,
                           metadata,
                           options
}) => {
    return (
        <div className={`item`}>
            {
                locations.map(location => {
                    const { type='', data={}, dependents=[], id='', nodes_id=''} = location || {};
                    const { location_identity='' } = data || {};

                    return (
                        <Accordion
                            key={id || nodes_id}
                            type={type || model}
                            label={location_identity}
                            open={true}
                            menu={
                                <ItemMenu
                                    item={location}
                                    model={type || model}
                                    id={id || nodes_id}
                                    dependent={dependent}
                                    options={options}
                                />
                            }
                            children={
                                <CapturesView data={dependents} model={model} />
                            } />
                    )
                })
            }
            <Accordion key={'md'} type={'info'} label={`Metadata`} open={true}>
                <Item view={'show'} model={model} data={metadata} />
            </Accordion>
        </div>
    )
}

export default LocationsView;
