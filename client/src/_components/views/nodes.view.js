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
import File from '../common/file';
import { groupBy } from '../../_utils/data.utils.client';

/**
 * Inline vertical accordion menu component.
 * - Creates accordion containers for dependent nodes that can
 *   be toggled.
 *
 * @public
 * @return {JSX.Element}
 */

const AccordionTab = ({node}) => {

    // accordion toggle state
    const [toggle, setToggle] = React.useState(false);

    return (
        <div className={`accordion ${toggle === node.id ? ' active' : ''}`}>
            <div className={`h-menu ${node.type}`}>
                <ul>
                    <li key={`${node.id}_ptr`}>
                                <button
                                    title={`View ${node.label}.`}
                                    onClick={() => {setToggle(!toggle)}}
                                >
                                    {toggle ? <Icon type={'vopen'} /> : <Icon type={'vclose'} />}
                                </button>

                    </li>
                    <li key={`${node.id}_type`}>
                        <button
                            className={toggle === node.id ? 'active' : ''}
                            title={`View ${node.label}.`}
                            onClick={() => {setToggle(!toggle)}}
                        >
                            <Icon type={node.type} /> {getModelLabel(node.type)}
                        </button>
                    </li>
                    <li key={`${node.id}_label`}>
                        <button
                            className={toggle === node.id ? 'active' : ''}
                            title={`View ${node.label}.`}
                            onClick={() => {setToggle(!toggle)}}
                        >
                            {node.label}
                        </button>
                    </li>
                </ul>
            </div>
            {
                toggle ? <ViewItem node={node}/> : ''
            }
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

    // get any available dependents
    const { dependents=[], files=[] } = node || {};

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
                <ViewFileList files={files}/>
            </div>
            <div>
                <ViewItemList nodes={dependents}/>
            </div>
        </div>

    );
}


/**
 * View file records associated with a node.
 *
 * @public
 * @return {JSX.Element}
 */

const ViewFileList = ({files}) => {

    // sort and group files by type
    files = (files || [])
        // // sort alphabetically
        .sort(function(a, b){
            // TODO sort station numbers in strings
            return a.file_type.localeCompare(b.file_type);
        });
    files = groupBy(files, 'file_type');

    if (Object.keys(files).length > 0)
        console.log('Files:', files)

    return (
        Object.keys(files).length > 0
            ?   <div>
                    {
                        Object.keys(files).map(key => {
                            return (
                                <div key={key} >
                                    <h5>{getModelLabel(key, 'label')}</h5>
                                    {
                                        files[key]
                                        .map((file, index) =>
                                                <File
                                                    index={index}
                                                    key={file.id}
                                                    data={file}
                                                    scale={'thumb'}
                                                />
                                            )
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            : ''
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
                nodes.map(node => <AccordionTab key={node.id} node={node}/>)
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

    // get dependent data
    const { dependents={} } = data || {};

    console.log('Node view:', data)

    // render node tree
    return (
        <div className={`item`}>
            <Item data={data} model={model} view={'show'} />
            <ViewItemList nodes={dependents} />
        </div>
    )
}

export default NodesView;
