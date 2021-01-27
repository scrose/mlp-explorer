/*!
 * MLP.Client.Components.Navigator.Tree
 * File: tree.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { useData } from '../../_providers/data.provider.client';
import Loading from '../common/loading';
import { capitalize } from '../../_utils/data.utils.client';
import Icon from '../common/icon';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import { getItemLabel } from '../../_services/schema.services.client';

/**
 * Inline menu component to edit records.
 *
 * @public
 * @param text
 * @param {boolean} toggle
 * @param {Function} setToggle
 * @param {String} id
 * @param {String} model
 * @return {JSX.Element}
 */

const TreeNodeMenu = ({ text='node', toggle, setToggle, id, model }) => {
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
                <li>{text}</li>
            </ul>
        </div>
    );
};

/**
 * Navigation tree node list component.
 *
 * @public
 * @return {React.Component}
 */

const TreeNodeList = ({data}) => {
    console.log('Tree node list:', data)
    return (
        <ul>
            {
                data.map((item, index) => {
                    const { data={} } = item || {};
                    return (
                        <li key={`${data.nodes_id}`}>
                            <TreeNode data={item} />
                        </li>
                    )
                })
            }
        </ul>

    );
}

/**
 * Navigation tree node component.
 *
 * @public
 * @return {React.Component}
 */

const TreeNode = ({data}) => {
    console.log('Tree node:', data)
    const [toggle, setToggle] = React.useState(false);

    // get any available dependent nodes
    const { dependents=[] } = data || {};

    return (
            <div className={'tree-node'}>
                <div>
                {
                    <TreeNodeMenu
                        text={getItemLabel(data)}
                        toggle={toggle}
                        setToggle={setToggle}
                        id={data.nodes_id}
                        model={data.type}
                    />
                }
                </div>
                <div className={`collapsible${toggle ? ' active' : ''}`}>
                    <TreeNodeList data={dependents}/>
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
    const _isMounted = React.useRef(true);
    const treeRoute = '/nodes';


    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        let load = async() => {
            return await api.get(treeRoute)
                .then(res => {
                    const { data={} } = res || {};
                    console.log('Navigator Response:', data)
                    return data;
                })
        }
        load()
            .then(res => {
                // update state with response data
                if (_isMounted.current) {
                    setNodeData(res);
                }
            })
            .catch(err => console.error(err));

        return () => {_isMounted.current = false; load=null};
    }, [api]);

    return (
        nodeData
        ? <div className={'tree'}>
                <ul className={'tree'}>
                {
                    Object.keys(nodeData).map((key, index) => {
                        return (
                            <li key={`item_${index}`}>
                                <div>
                                    <h4>{capitalize(key)}</h4>
                                    <TreeNodeList data={nodeData[key]} />
                                </div>
                            </li>
                        )
                    })
                }
                </ul>
            </div>
        : <Loading/>
    )
}

export default TreeNavigator;