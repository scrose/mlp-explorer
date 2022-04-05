/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import DataView from '../views/data.view';
import Message from '../common/message';
import StaticView from '../views/static.view';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import {useWindowSize} from "../../_utils/events.utils.client";
import Footer from "../common/footer";

/**
 * Render editor panel component (authenticated users).
 *
 * @public
 */

const Editor = () => {
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
                    <Heading/>
                    <Message/>
                    {
                        router.staticView
                            ? <StaticView type={
                                router.staticView === 'dashboard'
                                    ? 'dashboardEdit'
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

export default React.memo(Editor);