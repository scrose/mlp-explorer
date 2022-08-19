/*!
 * MLP.Client.Components.Navigation.Viewer
 * File: viewer.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Dialog from '../common/dialog';
import HelpView from '../views/help.view';
import Exporter from '../tools/export.tools';
import Download from '../common/download';
import { redirect } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Viewer menu component.
 *
 * @public
 */

const ViewerMenu = ({
                        id = '',
                        fileType = '',
                        filename = '',
                        compact = true,
                    }) => {

    const router = useRouter();

    // toggle to dhow/hide popup dialogs
    const [dialogToggle, setDialogToggle] = React.useState('');

    // generate unique ID value for form inputs
    const menuID = Math.random().toString(16).substring(2);

    // visibility of menu items
    const isVisible = {
        download: fileType === 'modern_images'
            || fileType === 'historic_images'
            || fileType === 'supplemental_images',
        iat: fileType === 'modern_images'
            || fileType === 'historic_images'
            || fileType === 'supplemental_images',
    };

    const _viewerDialogs = {
        help: <HelpView id={'index'} setToggle={setDialogToggle} />,
        exporter: <Dialog
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
                    {
                        isVisible.download &&
                        <li key={`${menuID}_menuitem_download`}>
                            <Download
                                filename={filename || 'download'}
                                label={!compact ? 'Download' : ''}
                                type={fileType}
                                format={'img'}
                                route={`/files/download/${id}`}
                                callback={console.log}
                            />
                        </li>
                    }
                    {
                        isVisible.iat &&
                        <li key={`${menuID}_menuitem_open_in_iat`}>
                            <Button
                                icon={'iat'}
                                label={!compact ? 'Open in IAT' : ''}
                                title={`Open Image in IAT.`}
                                onClick={() =>
                                    // launch IAT tool for capture image mastering:
                                    // - load historic images into Panel 1
                                    // - load modern images into Panel 2
                                    router.update(
                                        fileType === 'modern_images'
                                            ? `/iat?input2=${id}&type2=${fileType}`
                                            : `/iat?input1=${id}&type1=${fileType}`
                                    )
                                }
                            />
                        </li>
                    }
                    <li className={'push'} key={`${menuID}_menuitem_iat`}>
                        <Button
                            icon={'iat'}
                            label={compact ? '' : 'Toolkit'}
                            title={`Image Analysis Toolkit`}
                            onClick={() => {
                                // redirect to IAT in viewer/editor
                                redirect('/iat')
                            }}
                        />
                    </li>
                    <li key={`${menuID}_menuitem_export`}>
                        <Button
                            icon={'export'}
                            label={!compact ? 'Export': ''}
                            title={`View data export options.`}
                            onClick={() => {
                                setDialogToggle('exporter');
                            }}
                        />
                    </li>
                    <li key={`${menuID}_menuitem_help`}>
                        <Button
                            icon={'help'}
                            label={!compact ? 'Help' : ''}
                            title={`View the help pages.`}
                            onClick={() => {
                                setDialogToggle('help');
                            }}
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

export default ViewerMenu;

