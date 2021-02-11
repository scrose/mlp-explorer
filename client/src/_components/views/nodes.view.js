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
    const { dependents=[], files=[], type=model } = node || {};

    // render tree node
    return (
        <div>
            <Accordion type={'info'} label={`${getModelLabel(type)} Metadata`}>
                <Item view={'show'} model={type} data={node} />
            </Accordion>
            <div>
                <FilesList files={files} />
            </div>
            <div>
                <NodeList nodes={dependents}/>
            </div>
        </div>
    );
}




/**
 * Navigation tree node list component.
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
                    <Accordion key={node.id} type={node.type} label={node.label}>
                        <NodeItem node={node}/>
                    </Accordion>)
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

    // render node tree
    return (
        <div className={`item`}>
            <NodeItem node={data} model={model} />
        </div>
    )
}

export default NodesView;
