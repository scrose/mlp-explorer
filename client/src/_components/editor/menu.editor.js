/*!
 * MLP.Client.Components.Editor.Menu
 * File: menu.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Breadcrumb navigation menu component.
 *
 * @public
 */

const MenuEditor = () => {
    const rootURL = '#'
    return (
        <nav className={'editor'}>
            <ul>
                <li><a href={rootURL}>New</a></li>
                <li><a href={rootURL}>Edit</a></li>
                <li><a href={rootURL}>Delete</a></li>
                <li><a href={rootURL}>Move</a></li>
                <li><a href={rootURL}>Merge</a></li>
            </ul>
        </nav>
    )
}

export default MenuEditor;
