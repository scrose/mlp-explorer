/*!
 * MLP.Client.Components.Menu.Viewer
 * File: viewer.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { redirect } from '../../_utils/paths.utils.client';

/**
 * Viewer menu component.
 *
 * @public
 */

const ViewerMenu = () => {
    return (
            <div className={'editor-tools h-menu'}>
                <ul>
                    <li className={'push'} key={`viewer_menuitem_iat`}>
                            <Button
                                icon={'master'}
                                title={`Image Analysis Toolkit`}
                                onClick={() => {redirect('/iat')}}
                            />
                    </li>
                </ul>
            </div>
    )
}

export default ViewerMenu;

