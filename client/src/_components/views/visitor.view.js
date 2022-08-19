/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Message from '../common/message';
import DataView from './data.view';
import StaticView from './static.view';
import { useRouter } from '../../_providers/router.provider.client';
import HeadingMenu from '../menus/heading.menu';
import Footer from "../common/footer";
import {useWindowSize} from "../../_utils/events.utils.client";

/**
 * Render viewer panel component (unauthenticated users).
 *
 * @public
 */

const VisitorView = () => {
    const router = useRouter();

    // window dimensions
    const [, winHeight] = useWindowSize();

    return (
        <div className={'viewer'}>
            <div
                className={`view`}
                style={{height: (winHeight - 140) + 'px'}}
            >
                <HeadingMenu />
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

export default React.memo(VisitorView);
