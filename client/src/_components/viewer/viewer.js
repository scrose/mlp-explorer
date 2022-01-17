/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Message from '../common/message';
import DataView from '../views/data.view';
import StaticView from '../views/static.view';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import Footer from "../common/footer";
import {useWindowSize} from "../../_utils/events.utils.client";

/**
 * Render viewer panel component (unauthenticated users).
 *
 * @public
 */

const Viewer = () => {
    const router = useRouter();

    // window dimensions
    const [, winHeight] = useWindowSize();

    return (
        <div className={'viewer'}>
            <div
                className={`view`}
                style={{height: (winHeight - 140) + 'px'}}
            >
                <Heading />
                <Message />
                {
                    router.staticView
                    ? <StaticView type={
                        router.staticView === 'dashboard'
                            ? 'dashboardView'
                            : router.staticView
                    } />
                    : <DataView />
                }
                <Footer/>
            </div>
        </div>
    )
};

export default React.memo(Viewer);
