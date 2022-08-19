/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import DataView from './data.view';
import Message from '../common/message';
import StaticView from './static.view';
import { useRouter } from '../../_providers/router.provider.client';
import HeadingMenu from '../menus/heading.menu';
import {useWindowSize} from "../../_utils/events.utils.client";
import Footer from "../common/footer";

/**
 * Render editor panel component (authenticated users).
 *
 * @public
 */

const EditorView = () => {
    const router = useRouter();

    // window dimensions
    const [, winHeight] = useWindowSize();

    return (
        <>
            <div className={'editor'}>
                <div
                    className={`view dashboard`}
                    style={{height: (winHeight - 140) + 'px'}}
                >
                    <HeadingMenu/>
                    <Message/>
                    {
                        router.staticView
                            ? <StaticView type={
                                router.staticView === 'dashboard'
                                    ? 'dashboardView'
                                    : router.staticView
                            }/>
                            : <DataView/>
                    }
                    <Footer/>
                </div>
            </div>
        </>
        )
};

export default React.memo(EditorView);