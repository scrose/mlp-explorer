/*!
 * MLP.Client.Components.Navigator.Tree
 * File: tree.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { useRouter } from '../../_providers/router.provider.client';
import Loading from '../common/loading';
import { capitalize } from '../../_utils/data.utils.client';
import Icon from '../common/icon';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { getNodeLabel, getNodeOrder } from '../../_services/schema.services.client';

/**
 * Inline tree node menu component.
 * - Creates collapsible containers for dependent nodes that can
 *   be toggled.
 * - Sets route for requested node data not yet loaded.
 *
 * @public
 * @param text
 * @param {boolean} toggle
 * @param {Function} setToggle
 * @param {Function} setRoute
 * @param {String} id
 * @param {String} model
 * @return {JSX.Element}
 */

const TreeNodeMenu = ({
                          id,
                          model,
                          text='...',
                          toggle,
                          setToggle
}) => {
    // text = text.length > 40 ? text.substring(0,40) + '...' : text;
    const api = useRouter();
    return (
        <div className={'tree-node h-menu'}>
            <ul>
                {
                    model !== 'historic_captures' && model !== 'modern_captures'
                        ?
                    <li>
                        <button
                            className={`tree-node toggle ${model}`}
                            title={`Expand ${text} items.`}
                            onClick={() => {
                                setToggle(!toggle);
                            }}
                        >
                            {toggle ? <Icon type={'hopen'} /> : <Icon type={'hclose'} />}
                        </button>
                    </li>
                        : ''
                }
                <li>
                    <button
                        className={`tree-node-label ${model}`}
                        title={`View ${text} metadata.`}
                        onClick={() => {
                            api.router(getNodeURI(model, 'show', id));
                        }}
                    >
                        <Icon type={model}/>
                    </button>
                </li>
                <li>
                    <button
                        className={`tree-node-label ${model}`}
                        title={`View ${text} metadata.`}
                        onClick={() => {
                            api.router(getNodeURI(model, 'show', id));
                        }}
                    >
                        {text}
                    </button>
                </li>
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

const TreeNode = ({node}) => {

    // create dynamic data state
    const [toggle, setToggle] = React.useState(false);
    const [loadedData, setLoadedData] = React.useState(null);

    // initialization
    const api = useRouter();
    const _isMounted = React.useRef(true);

    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        if (toggle && !loadedData) {
            const route = getNodeURI('nodes', 'show', node.id)
            let load = async () => {
                // request tree node data from API
                return await api.get(route)
                    .then(res => {
                        const { data = {} } = res || {};
                        return data;
                    });
            };
            load()
                .then(data => {
                    // update state with response data
                    if (_isMounted.current) {
                        setLoadedData(data);
                    }
                })
                .catch(err => console.error(err));

            return () => {
                _isMounted.current = false;
            };
        }
    }, [api, node, toggle, loadedData, setLoadedData]);

    // get any available dependent nodes
    const { dependents=[] } = loadedData || {};

    // render tree node
    return (
            <div className={'tree-node'}>
                <div>
                {
                    <TreeNodeMenu
                        id={node.id}
                        model={node.type}
                        text={node.label}
                        toggle={toggle}
                        setToggle={setToggle}
                    />
                }
                </div>
                <div className={`collapsible${toggle ? ' active' : ''}`}>
                    <TreeNodeList nodes={dependents}/>
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

const TreeNodeList = ({nodes}) => {
    return (
        <ul>
            {
                nodes
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
                    })
                    .map(node => {
                    return (
                        <li key={`${node.id}`}>
                            <TreeNode node={node} />
                        </li>
                    )
                })
            }
        </ul>

    );
}

/**
 * Map navigator component.
 *
 * @public
 * @return
 */

const TreeNavigator = () => {

    // create dynamic view state
    const [nodeData, setNodeData] = React.useState(null);

    // create dynamic view state
    const _isMounted = React.useRef(false);

    // initialization
    const api = useRouter();

    // API call for tree node
    const treeRoute = '/nodes';

    // API call to retrieve node data
    React.useEffect(() => {
        _isMounted.current = true;
        let load = async() => {
            return await api.get(treeRoute)
                .then(res => {
                    const { data={} } = res || {};
                    return data;
                })
        }
            load()
                .then(res => {
                    // update state with response data
                    if (_isMounted.current)
                        setNodeData(res);
                })
                .catch(err => console.error(err));

        return () => {_isMounted.current = false};
    }, [api]);

    // render node tree
    return (
        nodeData
        ? <div className={'tree'}>
                <ul>
                {
                    Object.keys(nodeData)
                        .map((key, index) => {
                        return (
                            <li key={`item_${index}`}>
                                <h4>{capitalize(key)}</h4>
                                <TreeNodeList nodes={nodeData[key]} />
                            </li>
                        )
                    })
                }
                </ul>
            </div>
        : <Loading/>
    )
}

export default React.memo(TreeNavigator);