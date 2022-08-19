/*!
 * MLP.Client.Components.Views.Default
 * File: default.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {useRouter} from "../../_providers/router.provider.client";
import {createNodeRoute} from "../../_utils/paths.utils.client";
import {useData} from "../../_providers/data.provider.client";
import {useUser} from "../../_providers/user.provider.client";
import {groupBy, sorter} from "../../_utils/data.utils.client";
import Carousel from "../common/carousel";
import Comparator from "../common/comparator";
import {getDependentTypes, getModelLabel} from "../../_services/schema.services.client";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import MetadataView, {MetadataAttached} from "./metadata.view";
import FilesView from "./files.view";
import Tabs from "../common/tabs";
import NodesView from "./nodes.view";
import Loading from "../common/loading";

/**
 * Default view component for model data.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @return {JSX.Element}
 */

const DefaultView = ({model, data}) => {

    // create dynamic data states
    const [loadedData, setLoadedData] = React.useState(null);
    const [error, setError] = React.useState(null);
    const _isMounted = React.useRef(true);
    const router = useRouter();
    const api = useData();
    const user = useUser();

    // destructure node data
    const {
        hasDependents = false,
        dependents = [],
        files = [],
        metadata = {},
        attached = {},
        node = {},
    } = api.destructure(data) || {};

    const loadDependents = hasDependents && Array.isArray(dependents) && dependents.length === 0 && !loadedData

    // API call to retrieve dependents node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // extract node ID
        const { id=null } = node || {};

        // API call for page data
        if (!error && loadDependents) {
            const route = createNodeRoute(model, 'show', id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        const { dependents = [] } = data || {};
                        setLoadedData(dependents);
                    }
                })
                .catch(err => console.error(err), setError(true));
        }
        return () => {
            _isMounted.current = false;
        };
    }, [node, model, router, setLoadedData, loadDependents, error]);

    // group dependent nodes by model type
    const dependentsGrouped = groupBy( loadedData ? loadedData || [] : dependents ? dependents : [], 'type');

    // create tab index of metadata and files
    let _tabItems = [];

    // collect any unsorted captures
    let unsorted = [];

    // extract any attached (supplemental) metadata
    const attachedMetadata = Object.keys(attached)
        .filter(key => key !== 'comparisons' && attached[key].length > 0)
        .reduce((o, key) => {
            o[key] = attached[key];
            return o;
        }, {});

    // add sorted modern captures tabbed items
    if (dependentsGrouped.hasOwnProperty('modern_captures')) {
        // filter unsorted captures
        unsorted.push(...dependentsGrouped.modern_captures.filter(capture => {
            return !capture.status.sorted
        }));
        // filter sorted captures
        const sorted = dependentsGrouped.modern_captures.filter(capture => {
            return capture.status.sorted
        });
        if (sorted.length > 0) {
            _tabItems.push({
                label: 'Modern Captures',
                data: <Carousel
                    fit={'contain'}
                    autoslide={false}
                    images={sorted.map(item => {return item.refImage})}
                    titles={sorted.map(item => {return item.refImage.label})}
                    draggable={!!user}
                    metadata={sorted.map(item => {return item.metadata})}
                />,
            });
        }
    }

    // sort historic captures into sorted/unsorted
    if (dependentsGrouped.hasOwnProperty('historic_captures')) {
        // filter unsorted captures
        unsorted.push(...dependentsGrouped.historic_captures.filter(capture => {
            return !capture.status.sorted
        }));
        // filter sorted captures
        const sorted = dependentsGrouped.historic_captures.filter(capture => {
            return capture.status.sorted
        });

        // add sorted historic captures tabbed items
        if (sorted.length > 0) {
            _tabItems.push({
                label: 'Historic Captures',
                data: <Carousel
                    fit={'contain'}
                    autoslide={false}
                    images={sorted.map(item => {return item.refImage})}
                    titles={sorted.map(item => {return item.refImage.label})}
                    draggable={!!user}
                    metadata={sorted.map(item => {return item.metadata})}
                />,
            });
        }
    }

    // include comparisons metadata if:
    // - comparisons exist
    // - not at station node level
    if (
        model === 'stations'
        && attached.hasOwnProperty('comparisons')
        && Object.keys(attached.comparisons).length > 0
    ) _tabItems.push({
        label: 'Comparisons',
        data: <Comparator images={attached.comparisons} />,
    });

    // add tab for any unsorted captures
    if (unsorted.length > 0) {
        _tabItems.push({
            label: 'Unsorted Captures',
            data:
                <Carousel
                    fit={'contain'}
                    autoslide={false}
                    images={unsorted.map(item => {return item.refImage})}
                    titles={unsorted.map(item => {
                        return `${getModelLabel(item.type)}: ${item.refImage.label}`
                    })}
                    draggable={!!user}
                />,
        });
    }

    // include other dependent nodes
    const nodelist = Object.keys(dependentsGrouped)
        .filter(key => key !== 'historic_captures' && key !== 'modern_captures')
        .map(key => {
            // - for dependent nodes with single entries, do not include the accordion
            const singleNode = dependentsGrouped[key].length === 1;
            // get tab label
            // Note: relabel 'Locations' tab as 'Modern Captures'
            const tabLabel = getModelLabel(key, 'label');
            return {
                label: tabLabel === 'Locations' ? 'Modern Captures' : tabLabel,
                data: dependentsGrouped[key]
                    .sort(sorter)
                    .map(item => {
                        // get item metadata
                        const {
                            id,
                            type,
                            label,
                            hasDependents,
                            metadata,
                        } = api.destructure(item);

                        // For multiple dependent nodes, enclose metadata in accordion
                        return singleNode ? <div key={`node_${type}_${id}`}>
                                <Accordion
                                    type={'metadata'}
                                    label={`${getModelLabel(item.type)} Details`}
                                    menu={
                                        <EditorMenu
                                            view={'metadata'}
                                            model={item.type}
                                            id={id}
                                            owner={node}
                                            label={label}
                                            metadata={metadata}
                                            dependents={getDependentTypes(item.type)}
                                        />
                                    }
                                >
                                    <MetadataView node={item.node} model={item.type} metadata={item.metadata}/>
                                    {
                                        Object.keys(attachedMetadata).length > 0
                                        && <MetadataAttached key={`attached_${model}_${id}`} owner={node}
                                                             attached={attachedMetadata}/>
                                    }
                                    {
                                        Object.keys(files).length > 0
                                        && <FilesView key={`files_${model}_${id}`} owner={node} files={files}/>
                                    }
                                </Accordion>
                                <NodesView model={type} data={item} />
                            </div>
                            : <Accordion
                                key={id}
                                id={id}
                                type={type}
                                label={label}
                                hasDependents={hasDependents}
                                menu={
                                    <EditorMenu
                                        view={'default'}
                                        model={type}
                                        id={id}
                                        owner={node}
                                        label={label}
                                        metadata={metadata}
                                        dependents={getDependentTypes(type)}
                                    />
                                }
                            >
                                <NodesView model={type} data={item} />
                            </Accordion>
                    }),
            };
        });

    // add dependent nodes to tablist
    if (nodelist.length > 0) _tabItems = nodelist.concat(_tabItems);

    // add metadata tab for current node
    // - place attached metadata and supplementary files in same tab
    if (_tabItems.length > 1) _tabItems.push({
        label: `${getModelLabel(model)} Details`,
        data: <>
            <MetadataView key={`${model}_${node.id}`} node={node} model={model} metadata={metadata} />
            {
                Object.keys(attachedMetadata).length > 0
                && <MetadataAttached key={`attached_${model}_${node.id}`} owner={node} attached={attachedMetadata} />
            }
            {
                Object.keys(files).length > 0
                && <FilesView key={`files_${model}_${node.id}`} owner={node} files={files} />
            }
        </>
    });

    return hasDependents ? _tabItems.length > 0
        ? <Tabs items={_tabItems} orientation={'horizontal'} />
        : <Loading/> : <></>

};

export default DefaultView;