/*!
 * MLP.Client.Components.Views.SurveySeasons
 * File: seasons.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import Accordion from '../common/accordion';
import NodeMenu from '../menus/node.menu';
import { getNodeLabel } from '../../_services/schema.services.client';
import NodesView from './nodes.view';

/**
 * Stations view component.
 *
 * @public
 * @param {Object} metadata
 * @param {Object} dependents
 * @param {Object} options
 * @return {JSX.Element}
 */

const SeasonsView = ({
                          node,
                          dependents=[],
                          options
}) => {


    console.log('Survey Season:', node)
    return (
        <>
            <Accordion
                key={`md_${node.id}`}
                type={'info'}
                label={`Station Metadata`}
                loaded={dependents.length > 0}
                open={false}>
                <Item view={'show'} model={'stations'} data={node} />
            </Accordion>
            {
                (dependents || []).map(dependent => {
                    const { type='', id='', nodes_id=''} = dependent || {};
                    return (
                        type === 'modern_visits'
                            ? <Accordion
                                key={id || nodes_id}
                                id={id || nodes_id}
                                type={type}
                                open={true}
                                label={getNodeLabel(dependent)}
                                menu={
                                    <NodeMenu
                                        node={dependent}
                                        model={type}
                                        id={id || nodes_id}
                                        dependent={'locations'}
                                        options={options}
                                    />}
                            >
                                <NodesView model={type} node={dependent} />
                                </Accordion>
                            : <NodesView
                                key={id || nodes_id}
                                model={type}
                                node={dependent}
                            />
                    )
                })
            }
        </>
    )
}

export default SeasonsView;
