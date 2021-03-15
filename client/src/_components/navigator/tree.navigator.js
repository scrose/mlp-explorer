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
import Button from '../common/button';

/**
 * Inline tree node menu component.
 * - Creates collapsible containers for dependent nodes that can
 *   be toggled.
 * - Sets route for requested node data not yet loaded.
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @param {String} label
 * @param {boolean} toggle
 * @param {Function} onToggle
 * @param {String} isCurrent
 * @param {boolean} hasDependents
 * @return {JSX.Element}
 */

const TreeNodeMenu = ({
                          id,
                          model,
                          label='...',
                          toggle,
                          setToggle,
                          isCurrent='',
                          hasDependents=false
}) => {

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
        router.update(getNodeURI(model, 'show', id));
    }

    // toggle button classnames
    const classnames = [
        'tree-node',
        hasDependents ? 'toggle' : 'leaf',
        toggle ? 'active' : '',
        isCurrent ? 'current' : ''
    ];

    return (
        <div className={'tree-node h-menu'}>
            <ul>
                {
                    hasDependents ?
                    <li>
                        <Button
                            icon={toggle || isCurrent ? 'hopen' : 'hclose'}
                            className={classnames.join(' ')}
                            title={`Expand ${label}.`}
                            onClick={handleToggle}
                        />
                    </li>
                        : ''
                }
                <li>
                    <Button
                        icon={model}
                        className={`tree-node-icon ${isCurrent ? ' current' : ''}`}
                        title={`View ${getModelLabel(model)}: ${label}`}
                        onClick={handleView}
                    />
                </li>
                <li>
                    <Button
                        label={label}
                        className={`tree-node-label`}
                        title={`View ${getModelLabel(model)}: ${label}`}
                        onClick={handleView}
                    />
                </li>
            </ul>
        </div>
    );
};

/**
 * Navigation tree node component.
 *
 * @public
 * @param {String} id
 * @param {Object} node
 * @param {String} type
 * @param {String} label
 * @param {String} hasDependents
 * @return {JSX.Element}
 */

const TreeNode = ({id, type, label, hasDependents}) => {

    // create dynamic data states
    const [toggle, setToggle] = React.useState(checkNode(id));
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
        setCurrent(api.nodes.includes(id));
        if (api.nodes.includes(id))
            setToggle(api.nodes.includes(id));

        if (toggle && Array.isArray(loadedData) && loadedData.length === 0) {
            const route = getNodeURI('nodes', 'show', id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        // destructure any available dependent nodes
                        let { data = {} } = res || {};
                        const { dependents=[] } =  data || {};
                        setLoadedData(dependents);
                    }
                })
                .catch(err => console.error(err)
                );
        }
        return () => {
            _isMounted.current = false;
        };
    }, [api, router, id, toggle]);

    return (
            <div className={'tree-node'}>
                {
                    <TreeNodeMenu
                        id={id}
                        model={type}
                        label={label}
                        toggle={toggle}
                        setToggle={setToggle}
                        isCurrent={isCurrent}
                        hasDependents={hasDependents}
                    />
                }
                {
                    toggle
                        ?
                        Array.isArray(loadedData) && loadedData.length > 0
                            ? <TreeNodeList items={loadedData} />
                            : <Loading />
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

const TreeNodeList = ({items}) => {
    return (
        <ul>
            {
                items
                    .map(item => {
                        const { node={}, hasDependents=false } = item || {};
                        const { id='', type='' } = node || {};
                        return {
                            type: type,
                            id: id,
                            label: getNodeLabel(item),
                            order: getNodeOrder(type || '') || 0,
                            hasDependents: hasDependents
                        }
                    })
                    // sort alphabetically
                    .sort(function(a, b){
                        return a.label.localeCompare(b.label);
                    })
                    // sort by node order
                    .sort(function(a, b){
                        return a.order - b.order;
                    })
                    .map(item => {
                    return (
                        <li key={`${item.id}`}>
                            <TreeNode
                                id={item.id}
                                type={item.type}
                                label={item.label}
                                hasDependents={item.hasDependents}
                            />
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

    // API endpoint to get node tree
    const treeRoute = '/nodes';

    // API call to retrieve node tree top level
    React.useEffect(() => {
        _isMounted.current = true;
        if (!nodeData || Object.keys(nodeData).length === 0) {
            router.get(treeRoute)
                .then(res => {
                    let { data = {} } = res || {};
                    if (_isMounted.current) {
                        setNodeData(data);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {_isMounted.current = false;};
    }, [nodeData, router]);

    // render node tree
    return (
        Object.keys(nodeData).length > 0
        ? <div className={'tree'} onClick={() => {setMenu(false)}}>
                <ul>
                {
                    Object.keys(nodeData)
                        .map((key, index) => {
                        return (
                            <li key={`item_${index}`}>
                                <h4><Icon type={key} />&#160;&#160;{getModelLabel(key)}</h4>
                                <TreeNodeList items={nodeData[key]} />
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