/*!
 * MLP.Client.Components.Navigator.Tree
 * File: tree.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { useRouter } from '../../_providers/router.provider.client';
import Icon, { Loading } from '../common/icon';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { getModelLabel, getNodeOrder } from '../../_services/schema.services.client';
import { addNode, checkNode, removeNode } from '../../_services/session.services.client';
import { useData } from '../../_providers/data.provider.client';
import Button from '../common/button';
import { sorter } from '../../_utils/data.utils.client';

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
                          hasDependents=false,
                          status=null
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

    // handle status of nodes: cascades status levels
    const getStatus = () => {
        if (status.compared) return 'mastered';
        if (status.mastered) return 'mastered';
        if (status.partial) return 'partial';
        if (status.repeated) return 'repeated';
        // if (status.located) return 'located';
        if (status.grouped) return 'grouped';
        return 'missing';
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
                            icon={toggle || isCurrent ? 'collapse' : 'expand'}
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
                        size={'lg'}
                        className={`tree-node-icon ${isCurrent ? ' current' : ''} ${status ? getStatus() : ''}`}
                        title={`View ${getModelLabel(model)}: ${label} ${status ? ' [' + getStatus() + ' captures]' : ''}`}
                        onClick={handleView}
                    />
                </li>
                <li>
                    <Button
                        label={label}
                        size={'sm'}
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
 * @param {Object} status
 * @return {JSX.Element}
 */

const TreeNode = ({id, type, label, hasDependents, status}) => {

    // create dynamic data states
    const [toggle, setToggle] = React.useState(checkNode(id));
    const [isCurrent, setCurrent] = React.useState(false);
    const [loadedData, setLoadedData] = React.useState([]);
    const [statusData, setStatusData] = React.useState(status);
    const treeNode = React.createRef();
    const _isMounted = React.useRef(true);

    // initialization
    const router = useRouter();
    const api = useData();

    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // include current node path as toggled
        setCurrent(api.nodes.includes(id));
        if (api.nodes.includes(id)) {
            setToggle(api.nodes.includes(id));
            // scroll current node into view
            treeNode.current.scrollIntoView();
        }

        if (hasDependents && toggle && Array.isArray(loadedData) && loadedData.length === 0) {
            const route = getNodeURI('nodes', 'show', id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        // destructure any available dependent nodes
                        let { data = {} } = res || {};
                        const { dependents=[], status=null } =  data || {};
                        setLoadedData(dependents);
                        setStatusData(status);
                    }
                })
                .catch(err => console.error(err)
                );
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        api,
        router,
        id,
        hasDependents,
        toggle,
        treeNode,
        loadedData,
        setLoadedData,
        setStatusData
    ]);

    return (
            <div id={`treenode_${id}`} ref={treeNode} className={'tree-node'}>
                {
                    <TreeNodeMenu
                        id={id}
                        model={type}
                        label={label}
                        toggle={toggle}
                        setToggle={setToggle}
                        isCurrent={isCurrent}
                        hasDependents={hasDependents}
                        status={statusData}
                    />
                }
                {
                    toggle && hasDependents
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

const TreeNodeList = ({items, filter}) => {
    return (
        <ul>
            {
                items
                    .map(item => {
                        const { node={}, hasDependents=false, status={}, label='' } = item || {};
                        const { id='', type='' } = node || {};
                        return {
                            type: type,
                            id: id,
                            label: label,
                            order: getNodeOrder(type || '') || 0,
                            hasDependents: hasDependents,
                            status: status
                        }
                    })
                    // sort alphabetically / numerically
                    .sort(sorter)
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
                                status={item.status}
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

const TreeNavigator = ({data, filter}) => {

    // render node tree
    return (
            data && Object.keys(data).length > 0
                ? <div className={'tree'}>
                    <ul>
                    {
                        Object.keys(data)
                            .map((key, index) => {
                            return (
                                <li key={`item_${index}`}>
                                    <h4><Icon type={key} />&#160;&#160;{getModelLabel(key, 'label')}</h4>
                                    <TreeNodeList
                                        items={data[key]}
                                        filter={filter}
                                    />
                                </li>
                            )
                        })
                    }
                    </ul>
                </div>
                : <Loading overlay={true}/>
                )
}

export default React.memo(TreeNavigator);