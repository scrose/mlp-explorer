/*!
 * MLP.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Loading from '../common/loading';
import ImageView from './image.view';
import LocationsView from './locations.view';
import StationsView from './stations.view';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { getModelLabel, getNodeLabel, getNodeOrder } from '../../_services/schema.services.client';
import Accordion from '../common/accordion';
import NodeMenu from '../menus/node.menu';
import Item from '../common/item';
import CapturesView from './captures.view';
import CaptureView from './capture.view';
import { load } from 'dotenv';

/**
 * Node list component.
 * - Discovers appropriate menu label text using schema
 * - Sorts node items: (1) Node order; (2) Alphabetically by label
 *
 * @public
 * @param {Array} nodes
 * @return {JSX.Element}
 */

const NodeList = ({items}) => {

    if (!Array.isArray(items)) return null;

    return (
        <>
        {
            items
                .map(item => {
                    const { node={}, metadata={}, hasDependents=false } = item || {};
                    const { id='', type='' } = node || {};
                    return {
                        id: id,
                        type: type,
                        node: node,
                        metadata: metadata,
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
                        <Accordion
                            key={item.id}
                            id={item.id}
                            type={item.type}
                            label={item.label}
                            hasDependents={item.hasDependents}
                            open={false}
                            menu={
                                <NodeMenu
                                    model={item.type}
                                    id={item.id}
                                    label={item.label}
                                    metadata={item.metadata}
                                />
                            }
                        >
                            <NodesView model={item.type} data={item} />
                        </Accordion>
                    )
                })
        }
    </>
    );
}

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
    const {dependents=[], metadata={}} = data || {};
    return (
        <>
            <Accordion
                type={'info'}
                label={`${getModelLabel(model)} Metadata`}
            >
                <Item model={model} metadata={metadata} />
            </Accordion>
            <NodeList items={dependents} />
        </>
    )
}



/**
 * Data item (record) component.
 *
 * @param {String} model
 * @param {Object} data
 * @public
 */

const NodesView = ({
                       model,
                       data = {}
}) => {

    // create dynamic data states
    const [loadedData, setLoadedData] = React.useState(data);
    const _isMounted = React.useRef(true);
    const router = useRouter();

    // get dependents data
    const { hasDependents=false, dependents=[], node={} } = loadedData || data || {};

    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // check if dependents exist and are loaded; if not, make API call
        const loaded = hasDependents && dependents.length === 0;

        // API call
        if (loaded && model && node) {
            const route = getNodeURI(model, 'show', node.id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        const { data={} } = res || {};
                        setLoadedData(data);
                    }
                })
                .catch(err => console.error(err)
                );
        }
        return () => {
            _isMounted.current = false;
        };
    }, [dependents, loadedData, setLoadedData, router, model, data]);

    // view components indexed by model type
    const itemViews = {
        stations: () => <StationsView
            data={loadedData}
        />,
        historic_visits: () => <LocationsView
            model={'historic_captures'}
            locations={[loadedData]}
        />,
        modern_visits: () => <LocationsView
            model={'modern_captures'}
            locations={dependents}
        />,
        historic_captures: () => <CaptureView
            fileType={'historic_images'}
            model={'historic_captures'}
            data={ loadedData }
        />,
        modern_captures: () => <CaptureView
            fileType={'modern_images'}
            model={'modern_captures'}
            data={ loadedData }
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
        />
    }

    return (
        model && (dependents.length > 0 || !hasDependents)
            ?
            <>
                {
                    itemViews.hasOwnProperty(model)
                        ? itemViews[model]()
                        : itemViews.default()
                }
            </>
            : <Loading/>)
}

export default NodesView;
