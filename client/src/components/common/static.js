/*!
 * MLP.Client.Components.Static
 * File: Static.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Dashboard from '../user/Dashboard';
import Login from '../user/login';
import Logout from '../user/Logout';
import { getStaticView } from '../../services/schema.services.client';

/**
 * Index of static components.
 *
 * @public
 * @return Component
 */

const renderStatic = {
    "dashboard": () => <Dashboard />,
    "login": () => <Login />,
    "logout": () => <Logout />
};

/**
 * Static view component.
 *
 * @public
 * @param route
 * @return Static component
 */

const Static = ({route}) => {

    // route to static view component
    const staticType = getStaticView(route);
    return (<>{ renderStatic[staticType]() }</>);

}

export default Static;