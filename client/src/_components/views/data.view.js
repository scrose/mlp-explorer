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
import { genSchema, getRenderType } from '../../_services/schema.services.client';
import Uploader from './importer.view';
import { getNodeURI, redirect } from '../../_utils/paths.utils.client';
import Importer from './importer.view';

/**
 * Build requested data view from API data.
 *
 * @public
 */

const DataView = () => {

    // extract API data
    const api = useData();
    const { view='', model='', schema={}, data=null, options=[] } = api || {};
    const render = getRenderType(view, model);

    // select default form callback for view
    const router = useRouter();

    // mounted flag
    const _isMounted = React.useRef(false);

    //
    // // update fieldset data
    // React.useEffect(() => {
    //     _isMounted.current = true;
    //     if (fieldsetData.length === 0) {
    //         setFieldsetData(fieldsets);
    //     }
    //     return () => {
    //         _isMounted.current = false;
    //     };
    // }, [fieldsets]);

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
            <ItemView />),
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
