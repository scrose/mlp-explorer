/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

export default ({}) => {
    return (
        <>
            <h4>What is the Mountain Legacy Project?</h4>
            <p>
                MLP is an interdisciplinary collaboration focused on exploring change
                in Canada's mountain environments. Utilizing over 140,000 images taken
                by land surveyors from 1861 - 1953, MLP researchers seek to re-photograph
                these images as accurately as possible and make the resulting image pairs
                available for further investigation. For more information on the project
                check out <a href={"https://www.mountainlegacy.ca"}> www.mountainlegacy.ca</a>.
            </p>
            <h4>What is Explorer?</h4>
            <p>
                Explorer is a map-based tool designed to allow anyone with a modern web
                browser to investigate the MLP collection. Clicking on a map point will
                show historic and modern comparative photographs. More images are added
                as they are completed, so visit often to see what's new!
            </p>
            <h4>What is the Image Analysis Toolkit (IAT)?</h4>
            <p>
                IAT is an image visualization web app that offers categorization,
                annotation, scaling, cross and wipe fades, and more. Image classification
                and descriptive statistics are also available.
            </p>
        </>
    )
}