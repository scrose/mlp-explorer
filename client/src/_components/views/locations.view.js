/*!
 * MLP.Client.Components.Views.Locations
 * File: locations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import { capitalize } from '../../_utils/data.utils.client';
import Accordion from '../common/accordion';
import ItemMenu from '../menus/item.menu';
import CapturesView from './captures.view';

/**
 * Model view component.
 *
 * @public
 * @param {Object} apiData
 * @param {Object} data
 * @return {JSX.Element}
 */

const LocationsView = ({model, data, dependent}) => {

    // render node tree
    return (
        <div className={`item`}>
            {
                data.map(location => {
                    const { dependents=[], id='', nodes_id='', type='', options=[] } = location || {};
                    const { data={} } = location || {};
                    const { location_identity = '' } = data || {};
                    return (
                        <Accordion
                            key={id}
                            type={type || model}
                            label={capitalize(location_identity || model)}
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
                <Item view={'show'} model={model} data={data} />
            </Accordion>
        </div>
    )
}

export default LocationsView;
