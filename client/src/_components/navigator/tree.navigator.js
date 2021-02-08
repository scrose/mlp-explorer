/*!
 * MLP.Client.Components.Navigator.Tree
 * File: tree.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { useRouter } from '../../_providers/router.provider.client';
import Loading from '../common/loading';
import Icon from '../common/icon';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { getModelLabel, getNodeLabel, getNodeOrder } from '../../_services/schema.services.client';
import { addNode, checkNode, removeNode } from '../../_services/session.services.client';
import { useData } from '../../_providers/data.provider.client';

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
                          setToggle,
                          isCurrent,
                          hasDependents=false
}) => {

    // restrict size of menu text
    // text = text.length > 40 ? text.substring(0,40) + '...' : text;
    const router = useRouter();

    // handle toggle events
    const handleToggle = () => {
        // toggle node to selected session nodes
        checkNode(id) ? removeNode(id) : addNode(id);
        // open collapsible
        setToggle(!toggle);
    }

    // handle view events
    const handleView = () => {
        // add node to session path
        addNode(id);
        // reroute to requested data view
        router.router(getNodeURI(model, 'show', id));
    }

    return (
        <div className={'tree-node h-menu'}>
            <ul>
                {
                    hasDependents ?
                    <li>
                        <button
                            className={`
                                tree-node toggle
                                ${model} 
                                ${toggle ? ' active' : ''}
                                ${isCurrent ? ' current' : ''}
                            `}
                            title={`Expand ${text} items.`}
                            onClick={handleToggle}
                        >
                            {toggle || isCurrent
                                ? <Icon type={'hopen'} />
                                : <Icon type={'hclose'} />}
                        </button>
                    </li>
                        : ''
                }
                <li>
                    <button
                        className={`tree-node-label ${model}`}
                        title={`View ${text} metadata.`}
                        onClick={handleView}
                    >
                        <Icon type={model}/>
                    </button>
                </li>
                <li>
                    <button
                        className={`tree-node-label ${model}`}
                        title={`View ${text} metadata.`}
                        onClick={handleView}
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

    // create dynamic data states
    const [toggle, setToggle] = React.useState(checkNode(node.id));
    const [isCurrent, setCurrent] = React.useState(false);
    const [loadedData, setLoadedData] = React.useState([]);
    const _isMounted = React.useRef(true);

    // initialization
    const router = useRouter();
    const api = useData();

    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // include current node path as toggled
        if (api.nodes.includes(node.id)) {
            setToggle(true);
            setCurrent(true);
        }

        if (toggle) {
            const route = getNodeURI('nodes', 'show', node.id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        setLoadedData(res);
                        console.log('Loaded data', res.data, node)
                    }
                })
                .catch(err => console.error(err));

        }
        return () => {
            _isMounted.current = false;
        };
    }, [api, router, node, toggle]);

    // boolean if node has dependent nodes
    // destructure any available dependent nodes
    const { data={} } =  loadedData || {};
    const { dependents=[] } =  data || {};
    const { hasDependents=false } =  node || {};

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
                        isCurrent={isCurrent}
                        hasDependents={hasDependents}
                    />
                }
                </div>
                {
                    hasDependents
                        ?
                        <div className={`collapsible${toggle ? ' active' : ''}`}>
                            <TreeNodeList nodes={dependents} />
                        </div>
                        : ''
                }
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

const TreeNavigator = ({setMenu}) => {

    const router = useRouter();

    // create dynamic view state
    const [nodeData, setNodeData] = React.useState({});

    // create dynamic view state
    const _isMounted = React.useRef(false);

    // API call for tree node
    const treeRoute = '/nodes';

    // API call to retrieve node tree top level
    React.useEffect(() => {
        _isMounted.current = true;
        router.get(treeRoute)
            .then(res => {
                const { data = {} } = res || {};
                if (_isMounted.current) {
                    setNodeData(data);
                }
            })
            .catch(err => console.error(err));

        return () => {_isMounted.current = false};
    }, [router]);

    // render node tree
    return (
        nodeData
        ? <div className={'tree'} onClick={() => {setMenu(false)}}>
                <ul>
                {
                    Object.keys(nodeData)
                        .map((key, index) => {
                        return (
                            <li key={`item_${index}`}>
                                <h4><Icon type={key} />&#160;&#160;{getModelLabel(key)}</h4>
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