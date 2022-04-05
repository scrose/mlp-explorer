/*!
 * MLP.Client.Components.Editor.Dashboard
 * File: dashboard.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react'
import {useUser} from "../../_providers/user.provider.client";

/**
 * Editor dashboard component
 *
 * @public
 * @return {Promise} result
 */

const DashboardEditor = () => {
    const user = useUser();
    return (
        <div className={'h-menu view-panel-group'}>
            <h2>MLE Editor</h2>
            { user && <p>You are logged in as an <strong>{ user.role }</strong></p> }
        </div>
    );
}

export default DashboardEditor;