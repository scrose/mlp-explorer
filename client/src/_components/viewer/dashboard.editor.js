/*!
 * MLP.Client.Components.Editor.Dashboard
 * File: dashboard.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { viewerGettingStarted, viewerIAT, viewerWelcome } from '../content/dashboard.static';



/**
 * Editor dashboard component
 *
 * @public
 * @return {Promise} result
 */


/**
 * Viewer dashboard component
 *
 * @public
 * @return {JSX.Element} result
 */

const DashboardEditor = () => {
    return (
        <div className={'h-menu view-panel-group'}>
            <ul>
                <li>
                    <div className={'view-panel blue'}>
                        { viewerWelcome }
                    </div>
                </li>
                <li>
                    <div className={'view-panel purple'}>
                        { viewerGettingStarted }
                    </div>
                </li>
                <li>
                    <div className={'view-panel pink'}>
                        { viewerIAT }
                    </div>
                </li>
            </ul>
        </div>
    );
}

export default DashboardEditor;