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
import ListNodes from '../nodes/list.nodes';
import NotfoundError from '../error/notfound.error';
import Loading from '../common/loading';
import ServerError from '../error/server.error';
import { useData } from '../../_providers/data.provider.client';
import { getRenderType } from '../../_services/schema.services.client';
import Uploader from './importer.view';

/**
 * Build requested data view from API data.
 *
 * @public
 */

const DataView = () => {

    // extract API data
    const api = useData();
    const { view='', model='', schema={}, data=null } = api || {};
    const render = getRenderType(view, model);

    // select default form callback for view
    const router = useRouter();
    const callback = router.post;

    // view components indexed by render type
    const renders = {
        form: () => (
            <Form
                model={model}
                init={data}
                schema={schema}
                callback={callback}
            />),
        item: () => (
            <ItemView />),
        upload: () => (
            <Uploader
                data={data}
                model={model}
                schema={schema}
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
