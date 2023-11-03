/*!
 * MLE.Client.Components.Menus.Viewer
 * File: viewer.menu.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *  * ----------
 * Description
 *
 * Viewer menu component
 *
 * ---------
 * Revisions
 * - 22-07-2023 Added new download selection button.
 */

import React from 'react';
import {getModelLabel} from "../../_services/schema.services.client";
import {useUser} from "../../_providers/user.provider.client";
import {useData} from "../../_providers/data.provider.client";
import {useNav} from "../../_providers/nav.provider.client";
import Button from "../common/button";
import {redirect} from "../../_utils/paths.utils.client";
import Dropdown from "../common/dropdown";
import {genID} from "../../_utils/data.utils.client";
import {useDialog} from "../../_providers/dialog.provider.client";
import styles from '../styles/menu.module.css';
import {NavigatorMenu} from "./navigator.menu";


/**
 *
 * View/edit options for the viewer component.
 *
 * @public
 * @return {JSX.Element}
 */

const ViewerPanelMenu = () => {
    const user = useUser();
    const nav = useNav();
    const dialog = useDialog();
    const api = useData();


    // get roles
    const {isAdmin=false} = user || {};

    // generate unique ID value for form inputs
    const menuID = genID();

    // sync API data
    const _handleRefresh = () => {
        nav.refresh();
        api.refresh();
    }

    return <div className={'viewer-menu'}>
        <div className={'h-menu'}>
            <ul>
                {
                    isAdmin && <li className={user ? 'push' : ''}>
                        <Dropdown
                            compact={nav.compact}
                            label={!nav.compact ? 'New' : ''}
                            items={[{
                                icon: 'surveyors',
                                type: 'surveyors',
                                label: `Add new ${getModelLabel('surveyors')}`,
                                callback: () => {dialog.setCurrent({dialogID: 'new_surveyor'})}
                            }, {
                                icon: 'projects',
                                type: 'projects',
                                label: `Add new ${getModelLabel('projects')}`,
                                callback: () => {dialog.setCurrent({dialogID: 'new_project'})}
                            }]} />
                    </li>
                }
                {
                    (nav.downloads || []).length > 0 &&
                    <li key={`${menuID}_menuitem_attached_downloads`}>
                        <Button
                            icon={'download'}
                            label={!nav.compact && 'Download Package'}
                            className={styles.active}
                            title={`Bulk download selected files.`}
                            onClick={() => {dialog.setCurrent({dialogID: 'bulk_download_selections'})}}
                        />
                    </li>
                }
                <li className={'push'}>
                    <Button
                        icon={'sync'}
                        label={!nav.compact && 'Refresh'}
                        onClick={_handleRefresh}
                    />
                </li>
                <li className={user ? '' : 'push'} key={`${menuID}_menuitem_iat`}>
                    <Button
                        icon={'iat'}
                        label={!nav.compact && 'Alignment Tool'}
                        title={`Go to Alignment Tool.`}
                        onClick={() => {
                            // redirect to Alignment Tool in viewer/editor
                            redirect('/toolkit');
                        }}
                    />
                </li>
                <li key={`${menuID}_menuitem_export`}>
                    <Button
                        icon={'export'}
                        label={!nav.compact && 'Export'}
                        title={`View data export options.`}
                        onClick={() => {
                            dialog.setCurrent({dialogID: 'exporter'});
                        }}
                    />
                </li>
                <li key={`${menuID}_menuitem_help`}>
                    <Button
                        icon={'help'}
                        label={!nav.compact && 'Help'}
                        title={`View the help pages.`}
                        onClick={() => {
                            dialog.setCurrent({dialogID: 'help'});
                        }}
                    />
                </li>
                {
                    isAdmin &&
                    <li key={`${menuID}_menuitem_options`}>
                        <Button
                            icon={'options'}
                            label={!nav.compact && 'Options'}
                            title={`Edit metadata options.`}
                            onClick={() => dialog.setCurrent({dialogID: 'options'})}
                        />
                    </li>
                }
            </ul>
        </div>
    </div>
}

/**
 * Panel menu component.
 *
 * @public
 * @return {JSX.Element}
 */

const ViewerMenu = () => {

    return <div className={'panel-menu h-menu'}>
        <ul>
            <li>
                <NavigatorMenu />
            </li>
            <li className={'push'}>
                <ViewerPanelMenu />
            </li>
        </ul>
    </div>
};

export default ViewerMenu;
