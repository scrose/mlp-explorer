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
import MenuEditor from './menu.editor';
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
    const { file={} } = api.data || {};
    const { filename=''} = file || {};

    return (
        <>
            <div className={'editor'}>
                <MenuEditor
                    className={'editor-tools'}
                    model={api.model}
                    view={api.view}
                    id={api.id}
                    label={api.label}
                    owner={api.owner}
                    metadata={api.metadata}
                    fileType={api.type}
                    filename={filename}
                    compact={false}
                    dependents={getDependentTypes(api.model)}
                />
                <div className={`view dashboard`}>
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