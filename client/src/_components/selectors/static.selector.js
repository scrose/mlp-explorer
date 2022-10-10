/*!
 * MLP.Client.Components.Selectors.Static
 * File: static.selector.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import DashboardView from '../views/dashboard.view';
import NotfoundError from '../error/notfound.error';
import UnavailableError from '../error/unavailable.error';
import ServerError from '../error/server.error';
import Loading from '../common/loading';
import ImageTools from '../iat/iat';
import Image from '../common/image';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Build requested static page view.
 *
 * @param {String} type
 * @public
 */

const StaticSelector = ({ type }) => {

    const router = useRouter();

    // view components indexed by render type
    const renders = {
        resources: () => <Image url={router.route} />,
        dashboardView: () => <DashboardView />,
        dashboardEdit: () => <DashboardView />,
        imageToolkit: () => <ImageTools />,
        notFound: () => <NotfoundError />,
        serverError: () => <ServerError />,
        unavailable: () => <UnavailableError />,
        default: () => <Loading />
    }

    // render static view
    return (
        <>
            { renders.hasOwnProperty(type) ? renders[type]() : <Loading/> }
        </>
        )

}

export default React.memo(StaticSelector);
