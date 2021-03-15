/*!
 * MLP.Client.Components.Common.View.Data
 * File: data.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useRouter } from '../../_providers/router.provider.client';
import NodesView from './nodes.view';
import NotfoundError from '../error/notfound.error';
import Loading from '../common/loading';
import ServerError from '../error/server.error';
import { useData } from '../../_providers/data.provider.client';
import { genSchema, getRenderType } from '../../_services/schema.services.client';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import Importer from './importer.view';

/**
 * Build requested data view from API data.
 *
 * @public
 */

const DataView = () => {

    const api = useData();
    const router = useRouter();

    // extract API data
    const { view='', model='', data=null, attributes={} } = api || {};
    const render = getRenderType(view, model);
    const schema = genSchema(view, model, attributes);

    // view components indexed by render type
    const renders = {
        form: () => (
            <Importer
                view={view}
                model={model}
                schema={schema}
                data={data}
                route={getNodeURI(model, view, api.root.id)}
                callback={(err, model, id) => {
                    if (err || !id) return;
                    router.update(getNodeURI(model, 'show', id));
                }}
            />),
        nodes: () => (
            <NodesView
                model={model}
                data={data}
            />),
        import: () => (
            <Importer
                view={view}
                model={model}
                schema={schema}
                data={data}
                route={getNodeURI(model, 'import', api.root.id)}
                callback={() => {
                    redirect(
                        getNodeURI(
                            api.root.type,
                            'show',
                            api.root.id
                        )
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
