/*!
 * MLP.Client.Components.Menu.Viewer
 * File: viewer.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { redirect } from '../../_utils/paths.utils.client';
import Download from '../common/download';
import Dialog from '../common/dialog';
import MetadataView from '../views/metadata.view';
import HelpView from '../views/help.view';
import Exporter from '../tools/export.tools';

/**
 * Viewer menu component.
 *
 * @public
 */

const MenuViewer = () => {

    // toggle to dhow/hide popup dialogs
    const [dialogToggle, setDialogToggle] = React.useState('');

    // generate unique ID value for form inputs
    const menuID = Math.random().toString(16).substring(2);

    const _viewerDialogs = {
        help: <HelpView id={'index'} setToggle={setDialogToggle} />,
        exporter:   <Dialog
            key={`${menuID}_dialog_export`}
            title={`Export Metadata to File`}
            setToggle={setDialogToggle}>
            <Exporter setToggle={setDialogToggle} />
        </Dialog>,
    };

    // show dialog popup
    const showDialog = (type) => {
        return _viewerDialogs.hasOwnProperty(type) ? _viewerDialogs[type] : '';
    };

    return (
        <>
            <div className={'editor-tools h-menu'}>
                <ul>
                    <li className={'push'} key={`${menuID}_menuitem_export`}>
                        <Button
                            icon={'export'}
                            label={'Export'}
                            title={`View data export options.`}
                            onClick={() => {setDialogToggle('exporter')}}
                        />
                    </li>
                    <li key={`${menuID}_menuitem_help`}>
                        <Button
                            icon={'help'}
                            label={'Help'}
                            title={`View the help pages.`}
                            onClick={() => {setDialogToggle('help')}}
                        />
                    </li>
                </ul>
            </div>
            {
                // render overlay dialog box
                showDialog(dialogToggle)
            }
        </>
    );
};

export default MenuViewer;

