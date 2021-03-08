/*!
 * MLP.Client.Components.Common.View.Data
 * File: data.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useRouter } from '../../_providers/router.provider.client';
import Form from '../common/form';
import ItemView from './item.view';
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
    const { dependents=[], options=[] } = data || {};
    const render = getRenderType(view, model);
    const schema = genSchema(view, model, attributes);

    // view components indexed by render type
    const renders = {
        form: () => (
            <Form
                model={model}
                init={data}
                options={options}
                schema={schema}
                callback={router.post}
            />),
        item: () => (
            <ItemView model={model} data={data} dependents={dependents} />),
        import: () => (
            <Importer
                view={view}
                model={model}
                options={options}
                schema={schema}
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
        <div className={'view'}>
            {
                renders.hasOwnProperty(render) ? renders[render]() : <Loading/>
            }
        </div>
    )
}

export default React.memo(DataView);
