/*!
 * MLP.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
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
import { sorter } from '../../_utils/data.utils.client';
import Loading from '../common/loading';
import EditorMenu from '../menus/editor.menu';
import { useData } from '../../_providers/data.provider.client';
import FilesView from './files.view';

/**
 * Node list component.
 * - Discovers appropriate menu label text using schema
 * - Sorts node items: (1) Node order; (2) Alphabetically by label
 *
 * @public
 * @param {Array} nodes
 * @return {JSX.Element}
 */

export const NodesList = ({ owner, items }) => {

    const api = useData();

    // check for empty of invalid node list
    if (!Array.isArray(items) || items.length === 0) return null;

    // filter and sort non-captures
    const nodes = items.filter(
        item => item.node.type !== 'historic_captures' && item.node.type !== 'modern_captures'
    ).sort(sorter);

    return (
        <>
            {
                nodes.map(item => {
                    const {id, type, label, hasDependents, metadata} = api.destructure(item);
                    return (
                        <Accordion
                            key={id}
                            id={id}
                            type={type}
                            label={label}
                            hasDependents={hasDependents}
                            open={false}
                            menu={
                                <EditorMenu
                                    model={type}
                                    id={id}
                                    owner={owner}
                                    label={label}
                                    metadata={metadata}
                                    dependents={getDependentTypes(type)}
                                />
                            }
                        >
                            <NodesView model={type} data={item} />
                        </Accordion>
                    );
                })
            }
            <FilesView
                files={
                    {
                        'historic_captures': items
                            .filter(item => item.node.type === 'historic_captures')
                            .map(item => {
                                return item.refImage;
                            }),
                        'modern_captures': items
                            .filter(item => item.node.type === 'modern_captures')
                            .map(item => {
                                return item.refImage;
                            }),
                    }
                }
                owner={owner}
            />
        </>
    );
};

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
    const { node, dependents, metadata, attached, files } = api.destructure(data) || {};
    return (
        <>
            <Accordion
                type={'show'}
                label={`Details`}
            >
                <MetadataView key={`${model}_${node.id}`} model={model} metadata={metadata} />
            </Accordion>
            <MetadataAttached owner={node} attached={attached} />
            <FilesView owner={node} files={files} />
            <NodesList owner={node} items={dependents} />
        </>
    );
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
                       data = {}
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
        node = {} } = loadedData || data || {};

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
                        const {response={} } = res || {};
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
            />
    };

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
        </>
};

export default NodesView;
