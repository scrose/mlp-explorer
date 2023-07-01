/*!
 * MLP.Client.Components.Views.Editor
 * File: editor.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import DataView from '../selectors/view.selector';
import Message from '../common/message';
import StaticView from '../selectors/static.selector';
import { useRouter } from '../../_providers/router.provider.client';
import HeaderMenu from '../menus/header.menu';
import {useWindowSize} from "../../_utils/events.utils.client";
import Footer from "../common/footer";
import AdminView from "./admin.view";

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
                    <HeaderMenu/>
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