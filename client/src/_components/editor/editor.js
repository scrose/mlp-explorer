/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import DataView from '../views/data.view';
import Message from '../common/message';
import StaticView from '../views/static.view';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import EditorMenu from '../menus/editor.menu';
import { useData } from '../../_providers/data.provider.client';
import { getDependentTypes } from '../../_services/schema.services.client';

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {

    // get router context provider
    const router = useRouter();
    const api = useData();

    return (
        <>
            <div className={'editor'}>
                <EditorMenu
                    className={'editor-tools'}
                    model={api.model}
                    view={api.view}
                    id={api.id}
                    label={api.label}
                    owner={api.owner}
                    metadata={api.metadata}
                    fileType={api.type}
                    dependents={getDependentTypes(api.model)}
                />
                <div className={'view'}>
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
                </div>
            </div>
        </>
        )
};

export default React.memo(Editor);