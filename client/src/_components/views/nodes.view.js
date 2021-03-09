/*!
 * MLP.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import { getModelLabel, getNodeLabel, getNodeOrder } from '../../_services/schema.services.client';
import { FilesList } from './files.view';
import Accordion from '../common/accordion';
import ItemView from './item.view';
import ItemMenu from '../menus/item.menu';

/**
 * Node item view component.
 *
 * @public
 * @param {Object} node
 * @param {String} model
 * @return {JSX.Element}
 */

const NodeItem = ({node, model}) => {

    // get any available dependents
    const { dependents=[], type=model, data={} } = node || {};

    // render tree node
    return (
        <div>
            <Accordion type={'info'} label={`${getModelLabel(type)} Metadata`}>
                <Item view={'show'} model={type} data={node} />
            </Accordion>
            <NodeList nodes={dependents} />
        </div>
    );
}

/**
 * Node list component.
 * - Discovers appropriate menu label text using schema
 * - Sorts node items: (1) Node order; (2) Alphabetically by label
 *
 * @public
 * @return {JSX.Element}
 */

const NodeList = ({nodes}) => {

    if (!Array.isArray(nodes)) return null;

    // initialize nodes
    nodes = (nodes || [])
        .map(node => {
            node.label = getNodeLabel(node);
            node.order = getNodeOrder(node);
            return node;
        })
        // sort alphabetically
        .sort(function(a, b){
            // TODO sort station numbers in strings
            return a.label.localeCompare(b.label);
        })
        // sort by node order
        .sort(function(a, b){
            return a.order - b.order;
        });

    return (
        <div>
            {
                nodes.map(node =>
                    <Accordion
                        key={node.id}
                        id={node.id}
                        type={node.type}
                        label={node.label}
                        open={false}
                        menu={
                            <ItemMenu
                                item={node}
                                model={node.type}
                                id={node.id}
                                options={node.options}
                            />
                        }
                    >
                        <ItemView dependents={node.dependents} data={node} model={node.type} />
                    </Accordion>
                )
            }
        </div>
    );
}

/**
 * Model view component.
 *
 * @public
 * @param {Object} apiData
 * @param {String} model
 * @return {JSX.Element}
 */

const NodesView = ({data, model}) => {
    return (
        <div className={`item`}>
            <NodeItem model={model} node={data} />
        </div>
    )
}

export default NodesView;
