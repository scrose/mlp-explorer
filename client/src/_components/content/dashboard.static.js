/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from "../common/icon";

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

/**
 * MLE viewer welcome message.
 *
 * @public
 */

export const viewerWelcome = <>
    <h4>The Mountain Legacy Project</h4>
    <h5><Icon size={'2x'} type={'mlp'} /></h5>
    <p>
        The Mountain Legacy Project (MLP) explores changes in Canada’s mountain
        landscapes through the world’s largest collection of systematic
        high-resolution historic mountain photographs.
    </p>
    <p>
        For more information
        about the project, visit <a
        target={'_blank'}
        rel={'noreferrer'}
        href={'http://www.mountainlegacy.ca'}>mountainlegacy.ca</a>.
    </p>
</>;

/**
 * MLE getting started message.
 *
 * @public
 */

export const viewerGettingStarted = <>
    <h4>Start Exploring!</h4>
    <h5><Icon size={'2x'} type={'locations'} /></h5>
    <p>
        Explorer is a map-based tool for browsing the MLP collection and viewing historic
        and their repeat (modern) survey images.</p>
    <p>Use the navigator panel on the left to explore the collection.</p>
</>;

/**
 * MLE getting started message.
 *
 * @public
 */

export const viewerIAT = <>
    <h4>Using the Image Analysis Toolkit</h4>
    <h5><Icon size={'2x'} type={'images'} /></h5>
    <p>
        Interact with the MLP collection images using the built-in Image Toolkit. Load and edit
        images from the MLP collection or your local computer.
    </p>
</>;