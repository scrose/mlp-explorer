/*!
 * MLP.Client.Components.Viewer.Dashboard
 * File: dashboard.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'

/**
 * Node management panel.
 *
 * @public
 * @return {Promise} result
 */

const ViewerPanelMenu = () => {
    return (
        <nav className={'panel'}>

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
            <ViewerPanelMenu />
        </div>
    );
}

export default DashboardViewer;
