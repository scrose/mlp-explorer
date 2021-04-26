/*!
 * MLP.Client.Components.Editor.Dashboard
 * File: dashboard.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Download from '../common/download';

/**
 * Systems preferences management panel.
 *
 * @public
 * @return {Promise} result
 */

/**
 * Node management panel.
 *
 * @public
 * @return {Promise} result
 */

const NodePanel = () => {
    return (
        <nav className={'panel'}>
            <h4>Export Data</h4>
            <ul>
                <li>
                    <p>
                        <Download
                            label={'Export GIS CSV'}
                            format={'csv'}
                            type={'export'}
                            route={'/nodes/export/gis/csv'}
                        />
                    </p>
                </li>
                <li>
                    <p>
                        <Download
                            label={'Export GIS JSON'}
                            format={'json'}
                            type={'export'}
                            route={'/nodes/export/gis/json'}
                        />
                    </p>
                </li>
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
            <NodePanel />
        </div>
    );
}

export default DashboardEditor;
