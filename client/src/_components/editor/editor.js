/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRenderType, getStaticView } from '../../_services/schema.services.client';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import DataView from '../views/data.view';
import Messenger from '../common/messenger';
import StaticView from '../views/static.view';
import MenuEditor from './menu.editor';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {

    // create dynamic view state
    const [apiData, setAPIData] = React.useState({});
    const api = useRouter();
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
    }, [api]);

    // destructure API data for settings
    const { view = '', model = {}, data = {}, path = {} } = apiData || {};
    const { name = '' } = model || {};
    const { nodes_id='', users_id='' } = data;
    const id = nodes_id ? nodes_id : users_id ? users_id : '';

    return (
        <div className={'viewer'}>
            <div className={'header'}>
                <BreadcrumbMenu path={path} />
                <Messenger />
                <MenuEditor id={id} model={name} view={view} />
                <Heading path={path} />
            </div>
            {
                api.staticView
                    ? <StaticView type={
                        api.staticView === 'dashboard' ? 'dashboardEdit' : api.staticView
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