/*!
 * MLP.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Item from '../common/item';
import { getModelLabel, getNodeLabel, getNodeOrder } from '../../_services/schema.services.client';
import Icon from '../common/icon';

/**
 * Inline item tab menu component.
 * - Creates tab containers for dependent nodes that can
 *   be toggled.
 *
 * @public
 * @return {JSX.Element}
 */

const TabMenu = ({nodes, toggle, setToggle}) => {

    return (
        <div className={'tab h-menu'}>
            <ul>
            {
                nodes.map(node => {
                    return (
                        <li key={`${node.id}`}>
                            <button
                                className={toggle === node.id ? 'active' : ''}
                                title={`View ${node.label}.`}
                                onClick={() => {
                                    setToggle(node.id);
                                }}
                            >
                                {toggle === node.id ? <Icon type={'hopen'} /> : <Icon type={'hclose'} />}
                                &#160;{node.label}
                            </button>
                        </li>
                    )
                })
            }
            </ul>
        </div>
    );
};

/**
 * Navigation tree node component.
 *
 * @public
 * @param {Object} node
 * @return {JSX.Element}
 */

const ViewItem = ({node}) => {

    // get any available dependent nodes
    const { dependents=[] } = node || {};

    // render tree node
    return (
        <div className={'item-data'}>
            <div>
                <h5>{`${getModelLabel(node.type)}: ${getNodeLabel(node)}`}</h5>
                {
                    <Item
                        view={'show'}
                        model={node.type}
                        data={node}
                    />
                }
            </div>
            <div>
                <ViewItemList nodes={dependents}/>
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

const ViewItemList = ({nodes}) => {

    // initialize nodes
    nodes = nodes
        .map(node => {
            node.label = getNodeLabel(node);
            node.order = getNodeOrder(node);
            return node;
        })
        // sort alphabetically
        .sort(function(a, b){
            return a.label.localeCompare(b.label);
        })
        // sort by node order
        .sort(function(a, b){
            return a.order - b.order;
        });

    // tab toggle state
    const [toggle, setToggle] = React.useState(
        nodes && nodes.length > 0
        ? nodes[0].id
        : null
    );

    return (
        <div className={'tab-container'}>
            <TabMenu
                nodes={nodes}
                toggle={toggle}
                setToggle={setToggle}
            />
            {
                nodes
                    .map(node => {
                        return toggle === node.id
                            ?
                            <div key={`${node.id}`} className={`tab`}>
                                <ViewItem node={node} />
                            </div>
                            : ''

                    })
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

const NodesView = ({data: apiData, model}) => {

    // get dependent data
    const { dependents={} } = apiData.data || {};

    // render node tree
    return (
        <div className={`item ${model}`}>
            <Item data={apiData} model={model} view={'show'} />
            <ViewItemList nodes={dependents} />
        </div>
    )
}

export default NodesView;
