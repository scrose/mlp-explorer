/*!
 * MLP.Client.Components.Navigator.Tree
 * File: tree.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import {useRouter} from '../../_providers/router.provider.client';
import {createNodeRoute} from '../../_utils/paths.utils.client';
import {getModelLabel, getNodeOrder} from '../../_services/schema.services.client';
import {addNode, checkNode, removeNode} from '../../_services/session.services.client';
import {useData} from '../../_providers/data.provider.client';
import Button from '../common/button';
import {capitalize, sorter} from '../../_utils/data.utils.client';
import Loading from '../common/loading';
import Accordion from "../common/accordion";
import {useNav} from "../../_providers/nav.provider.client";
import L from "leaflet";
import {useWindowSize} from "../../_utils/events.utils.client";

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
                          label = '...',
                          toggle,
                          setToggle,
                          setDialog = () => {
                          },
                          isCurrent = '',
                          hasDependents = false,
                          status = null
                      }) => {

    const router = useRouter();

    const [highlight, setHighlight] = React.useState(false);

    // handle toggle events
    const _handleToggle = () => {
        // toggle node to selected session nodes
        checkNode(id) ? removeNode(id) : addNode(id);
        // open collapsible
        setToggle(!toggle);
    }

    // handle view events
    const _handleView = () => {
        // add node to session path
        addNode(id);
        // reroute to requested data view
        router.update(createNodeRoute(model, 'show', id));
    }

    // handle status of nodes: cascades status levels
    const getStatus = () => {
        // if (status.compared) return 'compared';
        if (status.mastered) return 'mastered';
        if (status.partial) return 'partial';
        if (status.repeated) return 'repeated';
        if (status.located) return 'located';
        if (status.grouped) return 'grouped';

        // additional classifications for captures
        if (model === 'historic_captures' || model === 'modern_captures') {
            if (status.missing) return 'missing';
            if (status.sorted) return 'sorted';
            if (!status.sorted) return 'unsorted';
        }
        return 'unprocessed';
    }

    // toggle button classnames
    const classnames = [
        'tree-node',
        hasDependents ? 'toggle' : 'leaf',
        toggle || checkNode(id) ? 'active' : '',
        isCurrent ? 'current' : ''
    ];

    /**
     * Drag-and-drop handlers for node moves.
     *
     * @public
     * @param {Object} e
     */

    const _handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(true);
    };
    const _handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(false);
    };
    const _handleDrop = (e) => {
        e.preventDefault();
        // handle files to update form data state
        const nodeData = e.dataTransfer.getData('application/json') || null;
        setHighlight(false);

        // open dialog to process node move
        if (nodeData) {
            setDialog({
                type: 'move',
                model: nodeData.type,
                id: nodeData.id,
                ownerID: id,
                label: nodeData.label,
                ownerLabel: label,
                ownerType: model
            });
        }
    };

    return (
        <div
            className={'tree-node h-menu'}
            onDrop={_handleDrop}
            onDragOver={_handleDragOver}
            onDragLeave={_handleDragLeave}
        >
            <ul>
                <li>
                    <Button
                        icon={
                            hasDependents
                                ? (toggle ? 'collapse' : 'expand')
                                : 'empty'
                        }
                        className={classnames.join(' ')}
                        title={`Expand ${label}.`}
                        onClick={hasDependents ? _handleToggle : () => {
                        }}
                    />
                </li>
                <li>
                    <Button
                        icon={model}
                        size={'lg'}
                        className={`tree-node-icon ${isCurrent || highlight 
                            ? ' current' 
                            : ''} ${status ? getStatus() : ''}`}
                        title={
                            `View ${getModelLabel(model)}: ${label} ${status ? ' \nSTATUS: ' + capitalize(getStatus()) : ''}`
                        }
                        onClick={_handleView}
                    />
                </li>
                <li>
                    <Button
                        label={label}
                        size={'sm'}
                        className={`tree-node-label`}
                        title={`View ${getModelLabel(model)}: ${label}`}
                        onClick={_handleView}
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

const TreeNode = ({
                      id,
                      type,
                      label,
                      hasDependents,
                      status,
                      setDialog
                  }) => {

    // create dynamic data states
    const [toggle, setToggle] = React.useState(checkNode(id));
    const [isCurrent, setCurrent] = React.useState(false);
    const [loadedData, setLoadedData] = React.useState([]);
    const [statusData, setStatusData] = React.useState(status);
    const [error, setError] = React.useState(null);
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

        if (!error && hasDependents && toggle && Array.isArray(loadedData) && loadedData.length === 0) {
            const route = createNodeRoute('nodes', 'show', id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {

                        if (res.error) return setError(res.error);

                        // destructure any available dependent nodes
                        const {response = {}} = res || {};
                        let {data = {}} = response || {};
                        const {dependents = [], status = null} = data || {};
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
        error,
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
                    setDialog={setDialog}
                />
            }
            {
                toggle && hasDependents
                    ? error
                    ? <Button className={'msg error'} label={'An error occurred'} icon={'error'}/>
                    : Array.isArray(loadedData) && loadedData.length > 0
                        ? <TreeNodeList items={loadedData} setDialog={setDialog}/>
                        : <Loading/> : <></>
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

const TreeNodeList = ({items, filter, setDialog, showCurrent}) => {
    return (
        <ul>
            {
                items
                    .map(item => {
                        const {node = {}, hasDependents = false, status = {}, label = ''} = item || {};
                        const {id = '', type = ''} = node || {};
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
                    .sort(function (a, b) {
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
                                    setDialog={setDialog}
                                    showCurrent={showCurrent}
                                />
                            </li>
                        )
                    })
            }
        </ul>
    );
}

/**
 * [Node] Tree navigator component.
 *
 * @public
 *
 * @return
 */

const TreeNavigator = ({ hidden=true }) => {

    const nav = useNav();
    const treeRef = React.useRef();
    const [showCurrent, setShowCurrent] = React.useState(false);

    // mounted component flag
    const _isMounted = React.useRef(false);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    return (
        nav.tree && Object.keys(nav.tree).length > 0
            ? <div
                ref={treeRef}
                className={'tree'}
                style={{
                    display: hidden ? ' none' : ' block',
                    height: ( winHeight - 140 ) + 'px'
                }}
            >
                {/*<div className={'h-menu'}>*/}
                {/*    <ul><li className={'push'}>*/}
                {/*    <Button*/}
                {/*        className={'tree-node toggle'}*/}
                {/*        onClick={() => {*/}
                {/*            setShowCurrent(true);*/}
                {/*            setShowCurrent(false);*/}
                {/*        }}*/}
                {/*        label={"Scroll to Current"}*/}
                {/*    />*/}
                {/*    </li></ul>*/}
                {/*</div>*/}
                <ul className={'root'}>
                    {
                        Object.keys(nav.tree)
                            .map((key, index) => {
                                return (
                                    <Accordion
                                        key={`item_${index}`}
                                        type={key}
                                        label={getModelLabel(key, 'label')}
                                        open={true}
                                    >
                                        <TreeNodeList
                                            items={nav.tree[key]}
                                            filter={nav.filter}
                                            setDialog={nav.setDialog}
                                            showCurrent={showCurrent}
                                        />
                                    </Accordion>
                                )
                            })
                    }
                </ul>
            </div>
            : <Loading overlay={true}/>
    )
}

export default React.memo(TreeNavigator)