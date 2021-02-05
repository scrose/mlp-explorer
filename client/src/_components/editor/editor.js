/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getModelLabel, getRenderType } from '../../_services/schema.services.client';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import DataView from '../views/data.view';
import Messenger from '../common/messenger';
import StaticView from '../views/static.view';
import MenuEditor from './menu.editor';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import { useMessenger } from '../../_providers/messenger.provider.client';
import { getRootNode } from '../../_utils/data.utils.client';

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {

    // create dynamic view state
    const [apiData, setAPIData] = React.useState({});
    const api = useRouter();
    const msg = useMessenger();
    const _isMounted = React.useRef(false);

    /**
     * Load API data.
     *
     * @public
     */

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        _isMounted.current = true;

        // request data if not static view
        if (!api.staticView)
            api.get(api.route)
                .then(data => {
                    console.log('API Response:', data);

                    // update state with response data
                    if (_isMounted.current)
                        setAPIData(data);
                });
        return () => {_isMounted.current = false;};
    }, [api, msg]);

    // destructure API data for settings
    const { view = '', model = {}, path = {} } = apiData || {};
    const { name = '' } = model || {};
    const node = getRootNode(path);

    return (
        <div className={'viewer'}>
            <div className={'header'}>
                <BreadcrumbMenu path={path} view={view} model={name} />
                <Messenger />
                <MenuEditor view={view} node={node} />
                <Heading node={node} prefix={view} model={name} />
            </div>
            {
                api.staticView
                    ? <StaticView type={
                        api.staticView === 'dashboard'
                            ? 'dashboardEdit'
                            : api.staticView
                    } />
                    : <DataView
                        view={view}
                        model={name}
                        data={apiData}
                        setData={setAPIData}
                        render={getRenderType(view, name)}
                    />
            }
        </div>
    )
};

export default Editor;