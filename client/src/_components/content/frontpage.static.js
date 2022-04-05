/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Icon from "../common/icon";
import {CCLogo} from "../common/logo";

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

export const viewerCC = <>
    <h4>Can I use MLP Images?</h4>
    <h5><CCLogo colour={'#B65179'} /></h5>
    <p>
        All images are available under a Creative Commons license, which means
        you can copy, print, and share for personal, non-commercial interests.
        If you intend to use images in publications or other media, including websites,
        please <a href={"mailto:mntnlgcy@uvic.ca"}><strong>drop us a note</strong></a> to
        let us know about this &mdash; it’s wonderful to see the images used and enjoyed.

    </p>
</>;