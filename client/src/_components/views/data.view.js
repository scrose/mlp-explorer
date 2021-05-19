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
import { createNodeRoute, redirect } from '../../_utils/paths.utils.client';
import Importer from '../tools/import.tools';
import FilterTools from '../tools/filter.tools';
import Loading from '../common/loading';

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
        filter: () => <FilterTools data={api.data} />,
        update: () => (
            <Importer
                view={api.view}
                model={api.model}
                schema={schema}
                data={api.metadata}
                route={createNodeRoute(api.model, api.view, api.id)}
                onCancel={() =>{redirect('/')}}
                callback={(err, model, id) => {
                    if (err || !id) return;
                    redirect(createNodeRoute(api.model, 'show', id));
                }}
            />),
        import: () => (
            <Importer
                view={api.view}
                model={api.model}
                schema={schema}
                data={api.metadata}
                onCancel={() =>{redirect('/')}}
                route={createNodeRoute(api.model, 'import', api.id)}
                callback={() => {
                    redirect(
                        createNodeRoute(api.model, 'show', api.id)
                    );
                }}
            />),
        download: () => <div>File Download</div>,
        404: () => <NotfoundError />,
        notFound: () => <NotfoundError />,
        500: () => <ServerError />,
        serverError: () => <ServerError />
    }

    // render data view
    return (
        <>
            {
                renders.hasOwnProperty(render)
                    ? renders[render]()
                    : <Loading/>
            }
        </>
    )
}

export default React.memo(DataView);
