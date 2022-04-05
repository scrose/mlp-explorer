/*!
 * MLP.Client.Components.Common.View.Data
 * File: data.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
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
import AccessError from '../error/access.error';
import { useUser } from '../../_providers/user.provider.client';
import {useRouter} from "../../_providers/router.provider.client";

/**
 * Build requested data view from API data.
 *
 * @public
 */

const DataView = () => {

    const api = useData();
    const router = useRouter();
    const user = useUser();

    // select render type and schema
    const render = getRenderType(api.view, api.model);
    const schema = genSchema({ view: api.view, model:api.model, user: user});

    // rendered view components indexed by render type
    const renders = {
        // render a node view
        nodes: () => (
            <NodesView
                model={api.model}
                data={api.data}
            />),
        // render a filtered list of nodes
        filter: () => <FilterTools data={api.data} />,
        // render an create/edit form
        update: () => (
            <Importer
                view={api.view}
                model={api.model}
                schema={schema}
                data={api.metadata}
                options={{
                    node: {
                        id: api.id,
                        type: api.model,
                        owner: api.owner
                    }
                }}
                route={createNodeRoute(api.model, api.view, api.id)}
                onCancel={() =>{redirect(createNodeRoute(api.model, 'show', api.id))}}
                callback={(err, model, id) => {
                    console.log(err, model, id)
                    redirect(router.route);
                }}
            />),
        // render an import form for file uploads
        import: () => (
            <Importer
                view={api.view}
                model={api.model}
                schema={schema}
                data={api.metadata}
                onCancel={() =>{redirect(createNodeRoute(api.model, 'show', api.id))}}
                route={createNodeRoute(api.model, 'import', api.id)}
                callback={(err, model, id) => {
                    console.log(err, model, id)
                    redirect(
                        createNodeRoute(api.model, 'show', api.id)
                    );
                }}
            />),
        // render a download link
        download: () => <div>File Download</div>,
        // render page not found page
        404: () => <NotfoundError />,
        notFound: () => <NotfoundError />,
        // render not authorized page
        401: () => <AccessError />,
        403: () => <AccessError />,
        // render server error page
        500: () => <ServerError />,
        serverError: () => <ServerError />
    }

    // render data view
    return (
        <>
            {
                renders.hasOwnProperty(render)
                    ? renders[render]()
                    : <Loading />
            }
        </>
    )
}

export default React.memo(DataView);
