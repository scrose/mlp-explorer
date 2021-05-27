/*!
 * MLP.Client.Components.Viewer.Dashboard
 * File: dashboard.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import { viewerGettingStarted, viewerIAT, viewerWelcome } from '../content/dashboard.viewer.page';


/**
 * Viewer dashboard component
 *
 * @public
 * @return {JSX.Element} result
 */

const DashboardViewer = () => {
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

export default DashboardViewer;
