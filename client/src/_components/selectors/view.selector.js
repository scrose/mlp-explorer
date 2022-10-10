/*!
 * MLP.Client.Components.Selectors.Views
 * File: view.selector.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import NodeSelector from './node.selector';
import NotfoundError from '../error/notfound.error';
import ServerError from '../error/server.error';
import { useData } from '../../_providers/data.provider.client';
import { getRenderType } from '../../_services/schema.services.client';
import FilterTools from '../tools/filter.tools';
import AccessError from '../error/access.error';
import Loading from "../common/loading";

/**
 * Filter requested data view by render type.
 *
 * @public
 */

const ViewSelector = () => {

    const api = useData();

    // select render type and schema
    const render = getRenderType(api.view, api.model);

    // rendered view components indexed by render type
    const renders = {
        // render a node view
        nodes: () => <NodeSelector model={api.model} data={api.data} />,
        // render a filtered list of nodes
        filter: () => <FilterTools data={api.data} />,
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

export default React.memo(ViewSelector);
