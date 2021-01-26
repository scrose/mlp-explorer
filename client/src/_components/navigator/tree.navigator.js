/*!
 * MLP.Client.Components.Navigator.Tree
 * File: tree.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { genSchema, getRenderType } from '../../_services/schema.services.client';
import { useData } from '../../_providers/data.provider.client';
import List from '../common/list';
import Loading from '../common/loading';
import Data from '../common/data';
import ItemMenu from '../menus/item.menu';
import Item from '../common/item';
import { capitalize } from '../../_utils/data.utils.client';
import { useUser } from '../../_providers/user.provider.client';
import Icon from '../common/icon';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';


/**
 * Inline menu component to edit records.
 *
 * @public
 * @param {boolean} toggle
 * @param {Function} setToggle
 * @param {String} id
 * @param {String} model
 * @return {JSX.Element}
 */

const TreeNodeMenu = ({ toggle, setToggle, id, model }) => {
    return (
        <div className={'tree-node h-menu'}>
            <ul>
                <li>
                    <button
                        title={`View details.`}
                        onClick={() => setToggle(!toggle)}
                    >
                        {toggle ? <Icon type={'up'}/> : <Icon type={'down'}/>}
                    </button>
                </li>
                <li>
                    <button
                        title={`View this ${model} item.`}
                        onClick={() => redirect(getNodeURI(model, 'show', id))}
                    >
                        <Icon type={'info'} />
                    </button>
                </li>
            </ul>
        </div>
    );
};

/**
 * Render .page footer
 *
 * @public
 * @return {React.Component}
 */

const TreeNode = ({data}) => {
    const [toggle, setToggle] = React.useState(false);

    return (
            <div className={'tree-node'}>
                {
                    <TreeNodeMenu
                        toggle={toggle}
                        setToggle={setToggle}
                        id={data.nodes_id}
                        model={data.type}
                    />
                }
                <div className={`collapsible${toggle ? ' active' : ''}`}>
                    {'item data'}
                </div>
            </div>

    );
}

/**
 * Map navigator component.
 *
 * @public
 * @return {JSX.Element}
 */

const TreeNavigator = () => {

    // create dynamic view state
    const [nodeData, setNodeData] = React.useState(null);
    const api = useData();

    const treeRoute = '/nodes';

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        api.get(treeRoute)
            .then(res => {
                const { data={} } = res || {};
                console.log('Navigator Response:', data)
                setNodeData(data);
            });
    }, [api, treeRoute, setNodeData]);

    // prepare node data for navigator tree
    // - return complete node item for each list element
    const filterItems = () => {
        return Object.keys(nodeData).map(key => {
            return (
                <div>
                    <div>{capitalize(key)}</div>
                    {
                        nodeData[key].map((item, index) => {
                            return (
                                <TreeNode key={index} data={item} />
                            )
                        })
                    }
                </div>
            )
    })};

    return (
        nodeData
        ? <div className={'tree'}>
            <List items={ filterItems() } classname={'items'} />
            </div>
        : <Loading/>
    )
}

export default TreeNavigator;