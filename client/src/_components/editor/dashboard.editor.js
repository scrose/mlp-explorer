/*!
 * MLP.Client.Components.Editor.Dashboard
 * File: dashboard.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'

const UserManager = () => {
    return (
        <nav className={'manager'}>
            <h4>User Management</h4>
            <ul>
                <li><a href={'/users'}>List users</a></li>
                <li><a href={'/users/register'}>Add new user</a></li>
            </ul>
        </nav>
    );
}

const DashboardEditor = () => {
    return (
        <div className="dashboard">
            <UserManager />
        </div>
    );
}

export default DashboardEditor;
