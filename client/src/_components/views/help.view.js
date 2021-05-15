/*!
 * MLP.Client.Components.Common.Views.Help
 * File: help.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Dialog from '../common/dialog';
import Tabs from '../common/tabs';
import { conceptsExplorerHelp, navigatorExplorerHelp, explorerHelp } from '../content/explorer.help';
import { editorBasicHelp, editorStartHelp } from '../content/editor.help';
import { alignmentIATHelp, iatBasicHelp, iatRegistrationHelp, iatStartHelp } from '../content/iat.help';

/**
 * Help info dialog component.
 *
 * @public
 */

const HelpView = ({setToggle, section=0, page=0}) => {

    // index of general help content
    const _pagesExplorer = [
        {
            label: 'Getting Started',
            data: explorerHelp
        },
        {
            label: 'Concepts',
            data: conceptsExplorerHelp
        },
        {
            label: 'Navigator',
            data: navigatorExplorerHelp
        },
    ];

    // index of editor help content
    const _pagesEditor = [
        {
            label: 'Getting Started',
            data: editorStartHelp
        },
        {
            label: 'Basic Features',
            data: editorBasicHelp
        },
    ];

    // index of IAT help content
    const _pagesIAT = [
        {
            label: 'Getting Started',
            data: iatStartHelp
        },
        {
            label: 'Basic Features',
            data: iatBasicHelp
        },
        {
            label: 'Image Alignment',
            data: alignmentIATHelp
        },
        {
            label: 'Image Registration',
            data: iatRegistrationHelp
        },
    ];

    // index of help sections
    const _sections = [
        {
            label: 'MLE Explorer',
            data: <Tabs
                orientation={'vertical'}
                items={_pagesExplorer}
                defaultTab={page}
                className={'help'}
            />
        },
        {
            label: 'MLE Editor',
            data: <Tabs
                orientation={'vertical'}
                items={_pagesEditor}
                defaultTab={page}
                className={'help'}
            />
        },
        {
            label: 'Image Analysis Toolkit (IAT)',
            data: <Tabs
                orientation={'vertical'}
                items={_pagesIAT}
                defaultTab={page}
                className={'help'}
            />
        }
    ];

    return <Dialog setToggle={setToggle} title={'Mountain Legacy Explorer User Guide'}>
            <Tabs
                orientation={'horizontal'}
                items={_sections}
                defaultTab={section}
                className={'help'}
            />
        </Dialog>
}

export default HelpView;
