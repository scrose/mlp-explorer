/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Badge from '../common/badge';

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
    <p>
        The Mountain Legacy Project (MLP) explores changes in Canada’s mountain
        landscapes through the world’s largest collection of systematic
        high-resolution historic mountain photographs (more than 120,000) and a
        vast and growing collection of repeat images (more than 8,000 photo pairs).
        Find out about our research and how we turn remarkable photos into
        real-world solutions for understanding climate change, ecological
        processes, and strategies for ecological restoration.
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
    <p>
        Explorer is a map-based tool for browsing the MLP collection and viewing historic
        and their repeat (modern) survey images. You can use the navigator panel on the left to
        explore the collection metadata and images organized by historical survey or project. Or, view
        survey station locations on a map by clicking on a station map marker to load details.
        You can also filter and search the survey metadata to select a particular surveyor, survey and survey season.
        More images are added as they are completed, so visit often to see what's new!
    </p>
    <p>
        Click the <Badge className={'purple'} icon={'help'} label={'Help'} /> menu button in the upper right
        of the page for more details.
    </p>
</>;

/**
 * MLE getting started message.
 *
 * @public
 */

export const viewerIAT = <>
    <h4>Using the Image Analysis Toolkit</h4>
    <p>
        Users can also interact with the MLP collection images using the
        built-in <a href={`/iat`}>Image Analysis Toolkit</a> (IAT). Use IAT
        to load and edit two MLP images side-by-side -- or load images from
        your local computer -- and download the results. The app features basic image editing
        such as scaling and cropping, an overlay viewer, and a specialized tool to align
        loaded images.
    </p>
    <p>
        Expect to see new features in the coming months, including image
        segmentation, annotation, cross and wipe fades, and much more. Stay tuned!
    </p>
</>;