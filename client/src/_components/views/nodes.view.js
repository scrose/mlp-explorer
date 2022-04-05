/*!
 * MLP.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import ImageView from './image.view';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { getDependentTypes, getModelLabel } from '../../_services/schema.services.client';
import Accordion from '../common/accordion';
import MetadataView, { MetadataAttached } from './metadata.view';
import CaptureView from './capture.view';
import { groupBy, sorter } from '../../_utils/data.utils.client';
import Loading from '../common/loading';
import EditorMenu from '../menus/editor.menu';
import { useData } from '../../_providers/data.provider.client';
import FilesView from './files.view';
import Tabs from '../common/tabs';
import Carousel from "../common/carousel";
import Comparator from "../common/comparator";
import {useUser} from "../../_providers/user.provider.client";

/**
 * Default view component for model data.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @return {JSX.Element}
 */

const DefaultView = ({
                         model,
                         data,
                     }) => {

    const api = useData();
    const user = useUser();
    const { node, dependents, metadata, attached, files } = api.destructure(data) || {};

    // group dependent nodes by model type
    const dependentsGrouped = groupBy(Array.isArray(dependents) ? dependents : [], 'type');

    // create tab index of metadata and files
    const _tabItems = [];

    // collect any unsorted captures
    let unsorted = [];

    // [historic captures]
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
            _tabItems.unshift({
                label: 'Historic Captures',
                data: <>
                    <Carousel
                        fit={'contain'}
                        autoslide={false}
                        images={sorted.map(item => {return item.refImage})}
                        titles={sorted.map(item => {return item.refImage.label})}
                        draggable={!!user}
                    />
                </>,
            });
        }
    }
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
                data: <>
                    <Carousel
                        fit={'contain'}
                        autoslide={false}
                        images={sorted.map(item => {return item.refImage})}
                        titles={sorted.map(item => {return item.refImage.label})}
                        draggable={!!user}
                    />
                </>,
            });
        }
    }

    // include comparisons metadata
    if (
        attached.hasOwnProperty('comparisons')
        && Object.keys(attached.comparisons).length > 0
    ) _tabItems.push({
        label: 'Comparisons',
        data: <Comparator images={attached.comparisons} />,
    });

    // include dependent nodes
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
                        // toggle accordion data as open/close

                        return !singleNode ? <Accordion
                                key={id}
                                id={id}
                                type={type}
                                label={label}
                                hasDependents={hasDependents}
                                menu={
                                    <EditorMenu
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
                            : <NodesView key={id} model={type} data={item} />;
                    }),
            };
        });
    // add dependent nodes to tablist
    if (nodelist) _tabItems.push(...nodelist);

    // extract any attached (supplemental) metadata
    const attachedMetadata = Object.keys(attached)
        .filter(key => key !== 'comparisons' && attached[key].length > 0)
        .reduce((o, key) => {
            o[key] = attached[key];
            return o;
        }, {});

    // add metadata for current node
    // - place attached metadata and supplementary files in same tab
    _tabItems.push({
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

    // add tab for any unsorted captures
    if (unsorted.length > 0) {
        _tabItems.push({
            label: 'Unsorted Captures',
            data: <>
                <Carousel
                    fit={'contain'}
                    autoslide={false}
                    images={unsorted.map(item => {return item.refImage})}
                    titles={unsorted.map(item => {
                        return `${getModelLabel(item.type)}: ${item.refImage.label}`
                    })}
                    draggable={!!user}
                />
            </>,
        });
    }

    return <Tabs items={_tabItems} orientation={'horizontal'} />

};

/**
 * Data item (record) component.
 *
 * @param {String} model
 * @param {Object} data
 * @public
 */

const NodesView = ({
                       model,
                       data = {},
                   }) => {

    // create dynamic data states
    const [loadedData, setLoadedData] = React.useState(data);
    const [error, setError] = React.useState(null);
    const _isMounted = React.useRef(true);
    const router = useRouter();

    // get dependents data
    const {
        hasDependents = false,
        dependents = [],
        node = {},
    } = loadedData || data || {};

    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // check if dependents exist and are loaded; if not, make API call
        const loaded = hasDependents && dependents.length === 0;

        // API call
        if (!error && loaded && model && node) {
            const route = createNodeRoute(model, 'show', node.id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        setLoadedData(data);
                    }
                })
                .catch(err => console.error(err),
                );
        }
        return () => {
            _isMounted.current = false;
        };
    }, [error, dependents, setLoadedData, router, model, node, hasDependents]);

    // view components indexed by model type
    const nodeViews = {
        historic_captures: () => <CaptureView
            fileType={'historic_images'}
            model={'historic_captures'}
            data={loadedData}
        />,
        modern_captures: () => <CaptureView
            fileType={'modern_images'}
            model={'modern_captures'}
            data={loadedData}
        />,
        historic_images: () => <ImageView
            model={'historic_images'}
            data={loadedData}
        />,
        modern_images: () => <ImageView
            model={'modern_images'}
            data={loadedData}
        />,
        supplemental_images: () => <ImageView
            model={'supplemental_images'}
            data={loadedData}
        />,
        default: () => <DefaultView
            model={model}
            data={loadedData}
        />,
    };
    //console.log('!!!', model, dependents, hasDependents, model && (dependents.length > 0 || !hasDependents))

    return <>

        {
            model && (dependents.length > 0 || !hasDependents) ?
                <>
                    {
                        nodeViews.hasOwnProperty(model)
                            ? nodeViews[model]()
                            : nodeViews.default()
                    }
                </>
                : <Loading />
        }
    </>;
};

export default NodesView;
