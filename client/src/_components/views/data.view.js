/*!
 * MLP.Client.Components.Common.View.Data
 * File: data.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import NodesView from './nodes.view';
import NotfoundError from '../error/notfound.error';
import ServerError from '../error/server.error';
import { useData } from '../../_providers/data.provider.client';
import { genSchema, getRenderType } from '../../_services/schema.services.client';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import Importer from './importer.view';
import FilterView from './filter.view';
import { Loading } from '../common/icon';
import CanvasView from './canvas.view';

/**
 * Build requested data view from API data.
 *
 * @public
 */

const DataView = () => {

    const api = useData();

    // select render type and schema
    const render = getRenderType(api.view, api.model);
    const schema = genSchema(api.view, api.model);

    // view components indexed by render type
    const renders = {
        nodes: () => (
            <NodesView
                model={api.model}
                data={api.data}
            />),
        filter: () => <FilterView data={api.data} />,
        update: () => (
            <Importer
                view={api.view}
                model={api.model}
                schema={schema}
                data={api.metadata}
                route={getNodeURI(api.model, api.view, api.id)}
                callback={(err, model, id) => {
                    if (err || !id) return;
                    redirect(getNodeURI(api.model, 'show', id));
                }}
            />),
        import: () => (
            <Importer
                view={api.view}
                model={api.model}
                schema={schema}
                data={api.metadata}
                route={getNodeURI(api.model, 'import', api.id)}
                callback={() => {
                    redirect(
                        getNodeURI(api.model, 'show', api.id)
                    );
                }}
            />),
        master: () => (
            <CanvasView
                input2={api.data}
                schema={schema}
                callback={() => {
                    redirect(
                        getNodeURI(api.model, 'show', api.id)
                    );
                }}
            />),
        notFound: () => <NotfoundError />,
        serverError: () => <ServerError />
    }

    // render data view
    return (
        <>
            {
                renders.hasOwnProperty(render) ? renders[render]() : <Loading/>
            }
        </>
    )
}

export default React.memo(DataView);
