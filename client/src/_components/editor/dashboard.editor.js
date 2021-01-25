/*!
 * MLP.Client.Components.Editor.Dashboard
 * File: dashboard.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Heading from '../common/heading';

/**
 * User management panel.
 *
 * @public
 * @return {Promise} result
 */

const UserPanel = () => {
    return (
        <nav className={'panel'}>
            <h4>User Management</h4>
            <ul>
                <li><a href={'/users'}>List users</a></li>
                <li><a href={'/users/register'}>Add new user</a></li>
            </ul>
        </nav>
    );
}

/**
 * Node management panel.
 *
 * @public
 * @return {Promise} result
 */

const NodePanel = () => {
    return (
        <nav className={'panel'}>
            <h4>User Management</h4>
            <ul>
                <li><a href={'/surveyors'}>Surveyors</a></li>
                <li><a href={'/surveys/'}>Surveys</a></li>
            </ul>
        </nav>
    );
}

/**
 * Editor dashboard component
 *
 * @public
 * @return {Promise} result
 */

const DashboardEditor = () => {
    return (
        <div className="dashboard">
            <Heading text={'Editor Dashboard'}/>
            <UserPanel />
            <NodePanel />
        </div>
    );
}

export default DashboardEditor;
