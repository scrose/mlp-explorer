/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getRenderType, getStaticRenderType } from '../../_services/schema.services.client';
import { getPath } from '../../_utils/paths.utils.client';
import Messenger from '../common/messenger';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import ViewerMenu from '../menus/viewer.menu';
import DataView from '../views/data.view';
import StaticView from '../views/static.view';
import { useData } from '../../_providers/data.provider.client';
import Heading from '../common/heading';

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

const Viewer = () => {

    // create dynamic view state
    const [values, setValues] = React.useState({});
    const [nodePath, setNodePath] = React.useState({});
    const [schema, setSchema] = React.useState(null);
    const [render, setRender] = React.useState('');
    const [view, setView] = React.useState('');
    const [model, setModel] = React.useState('');
    const [id, setIDValue] = React.useState('');

    const route = getPath();
    const api = useData();
    const _isMounted = React.useRef(true);

    // Lookup static view in schema
    const staticRenderType = getStaticRenderType(route) === 'dashboard'
        ? 'dashboardView'
        : getStaticRenderType(route);

    /**
     * Set current Item ID value. Retrieves ID value
     * from API data (if exists).
     *
     * @public
     * @param {Object} data
     */

    const setID = (data) => {
        const { nodes_id='', users_id='' } = data;
        const idValue = nodes_id ? nodes_id : users_id ? users_id : '';
        setIDValue(idValue);
    }

    /**
     * Set current Item ID value. Retrieves ID value
     * from API data (if exists).
     *
     * @public
     * @param {Object} data
     */

    const load = async () => {
        let res = await api.get(route)
            .then(res => {
                console.log('API Response:', res);
                return res;
            });

        // update state with response data
        if (_isMounted.current) {
            const { view = '', model = {}, data = {}, path = {} } = res || {};
            const { name = '', attributes = {} } = model;
            setRender(getRenderType(view, name));
            setView(view);
            setModel(name);
            setID(data);
            setValues(data);
            setNodePath(path);

            // lookup view in schema
            setSchema(genSchema(view, name, attributes));
        }
    }

    // non-static views: fetch API data and set view data in state
    // React.useEffect(() => {
    //     if (_isMounted.current)
    //         load(_isMounted).catch(err => console.error(err));
    //     return () => {_isMounted.current = false;};
    // }, [load]);

    return (
        <div className={'editor'}>
            <div className={'header'}>
                <BreadcrumbMenu path={nodePath} />
                <Messenger />
                <Heading path={nodePath} />
                <ViewerMenu id={id} model={model} view={view} />
            </div>
            {
                staticRenderType
                ? <StaticView type={staticRenderType} />
                : <DataView
                        route={route}
                        id={id}
                        view={view}
                        model={model}
                        values={values}
                        setValues={setValues}
                        schema={schema}
                        render={render}
                    />
            }
        </div>
    )
};

export default Viewer;
