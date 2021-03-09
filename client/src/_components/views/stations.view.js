/*!
 * MLP.Client.Components.Views.Stations
 * File: stations.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import Accordion from '../common/accordion';
import ItemMenu from '../menus/item.menu';
import CapturesView from './captures.view';
import { getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import LocationsView from './locations.view';
import ItemView from './item.view';

/**
 * Stations view component.
 *
 * @public
 * @param {Object} metadata
 * @param {Object} dependents
 * @param options
 * @return {JSX.Element}
 */

const StationsView = ({
                          dependents,
                          metadata,
                          options
}) => {

    return (
        <div className={`item`}>
            <Accordion key={'md'} type={'info'} label={`Station Metadata`} open={false}>
                <Item view={'show'} model={'stations'} data={metadata} />
            </Accordion>
            {
                dependents.map(dependent => {
                    const { type='', dependents=[], id='', nodes_id=''} = dependent || {};
                    return (
                        type === 'modern_visits'
                            ? <Accordion
                                key={id || nodes_id}
                                type={type}
                                open={true}
                                label={getNodeLabel(dependent)}
                                menu={
                                    <ItemMenu
                                        item={dependent}
                                        model={type}
                                        id={id || nodes_id}
                                        dependent={'locations'}
                                        options={options}
                                    />
                                }
                                children={
                                    <ItemView
                                        model={type}
                                        dependents={dependents}
                                        data={dependent}
                                    />
                                }
                            />
                            : <ItemView
                                    key={id || nodes_id}
                                    model={type}
                                    dependents={dependents}
                                    data={dependent}
                                />
                    )
                })
            }
        </div>
    )
}

export default StationsView;
