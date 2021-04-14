/*!
 * MLP.Client.Components.Viewer.Dashboard
 * File: dashboard.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Download from '../common/download';

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
                        uri={'/nodes/export/gis/csv'}
                        />
                    </p>
                </li>
                <li>
                    <p>
                        <Download
                            label={'Export GIS JSON'}
                            format={'json'}
                            type={'export'}
                            uri={'/nodes/export/gis/json'}
                        />
                    </p>
                </li>
            </ul>
        </nav>
    );
}

/**
 * Viewer dashboard component
 *
 * @public
 * @return {JSX.Element} result
 */

const DashboardViewer = () => {
    return (
        <div>
            <p>
                The Mountain Legacy Project explores changes in Canada’s mountain
                landscapes through the world’s largest collection of systematic
                high-resolution historic mountain photographs (>120,000) and a
                vast and growing collection of repeat images (>8,000 photo pairs).
                Find out about our research and how we turn remarkable photos into
                real-world solutions for understanding climate change, ecological
                processes, and strategies for ecological restoration.</p>
            <NodePanel />
        </div>
    );
}

export default DashboardViewer;
