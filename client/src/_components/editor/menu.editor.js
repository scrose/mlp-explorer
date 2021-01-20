/*!
 * MLP.Client.Components.Editor.Menu
 * File: menu.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getURL } from '../../_utils/paths.utils.client';

/**
 * Editor menu component.
 *
 * @public
 */

const MenuEditor = ({model, view}) => {
    const currentPath = getURL();
    return (
        view ?
        <nav className={'editor'}>
            <ul>
                <li><a href={`${currentPath}/new`}>New</a></li>
                {view !== 'list' ? <li><a href={`${currentPath}/edit`}>Edit</a></li> : ''}
                {view !== 'list' ? <li><a href={`${currentPath}/remove`}>Delete</a></li> : ''}
                {/*<li><a href={`${currentPath}/#`}>Move</a></li>*/}
                {/*<li><a href={`${currentPath}/#`}>Merge</a></li>*/}
            </ul>
        </nav>
            : ''
    )
}

export default MenuEditor;
