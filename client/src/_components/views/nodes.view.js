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
import { groupBy, sorter } from '../../_utils/data.utils.client';
import Loading from '../common/loading';
import MenuEditor from '../editor/menu.editor';
import { useData } from '../../_providers/data.provider.client';
import FilesView from './files.view';
import Tabs from '../common/tabs';
import ComparisonsView from './comparisons.view';

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

    // create tab index of metadata and files
    const _tabItems = [
        {
            label: `${getModelLabel(model)} Details`,
            data: <MetadataView key={`${model}_${node.id}`} model={model} metadata={metadata} />,
        },
    ];

    // include dependent nodes
    const dependentsGrouped = groupBy(Array.isArray(dependents) ? dependents : [], 'type');
    const nodelist = Object.keys(dependentsGrouped)
        .filter(
            key => key !== 'historic_captures' && key !== 'modern_captures')
        .map(key => {
            return {
                label: getModelLabel(key, 'label'),
                data: dependentsGrouped[key]
                    .sort(sorter)
                    .map(item => {
                        const {
                            id,
                            type,
                            label,
                            hasDependents,
                            metadata,
                        } = api.destructure(item);
                        return <Accordion
                            key={id}
                            id={id}
                            type={type}
                            label={label}
                            hasDependents={hasDependents}
                            open={false}
                            menu={
                                <MenuEditor
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
                        </Accordion>;
                    }),
            };
        });
    if (nodelist) _tabItems.push(...nodelist);

    // include comparisons metadata
    if (
        attached.hasOwnProperty('comparisons')
        && Object.keys(attached.comparisons).length > 0
    ) _tabItems.push({
        label: 'Comparisons',
        data: <ComparisonsView data={attached.comparisons} />,
    });

    // include other attached metadata
    const attachedMetadata = Object.keys(attached)
        .filter(key => key !== 'comparisons' && attached[key].length > 0)
        .reduce((o, key) => {
            o[key] = attached[key];
            return o;
        }, {});

    if (Object.keys(attachedMetadata).length > 0) _tabItems.push({
        label: 'Metadata',
        data: <MetadataAttached owner={node} attached={attachedMetadata} />,
    });

    // include attached files
    if (Object.keys(files).length > 0) _tabItems.push({
        label: 'Files',
        data: <FilesView owner={node} files={files} />,
    });

    // include unsorted captures
    if (dependentsGrouped.hasOwnProperty('historic_captures')) _tabItems.push({
        label: 'Historic Captures',
        data: <FilesView
            files={{
                historic_captures: dependentsGrouped.historic_captures.map(item => {
                    return item.refImage;
                }),
            }}
            owner={node}
        />,
    });
    if (dependentsGrouped.hasOwnProperty('modern_captures')) _tabItems.push({
        label: 'Modern Captures',
        data: <FilesView
            files={{
                modern_captures: dependentsGrouped.modern_captures.map(item => {
                    return item.refImage;
                }),
            }}
            owner={node}
        />,
    });

    return (
        <>
            <Tabs items={_tabItems} orientation={'horizontal'} />
            {/*<NodesList owner={node} items={dependents} />*/}
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
