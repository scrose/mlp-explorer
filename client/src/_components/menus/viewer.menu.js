/*!
 * MLP.Client.Components.Menus.Viewer
 * File: viewer.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
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
import {setNavView, setPref} from "../../_services/session.services.client";
import {useDialog} from "../../_providers/dialog.provider.client";

/**
 * Navigator menu component.
 *
 * View options for the navigator component.
 *
 * @public
 * @return {JSX.Element}
 */

export const NavigatorMenu = () => {

    const nav = useNav();
    const dialog = useDialog();

    // Sets the current navigation mode (tree/map/search/etc)
    // - set in state and user session storage
    const setMode = (navView) => {
        // toggle navigator visibility
        nav.setToggle(true);
        setPref('navToggle', true);
        // set navigator view
        nav.setMode(navView);
        nav.setResize(true);
        setNavView(navView);
    }

    return (
        <>
            <div className={'viewer-menu'}>
                <div className={'h-menu'}>
                    <ul>
                        <li>
                            <Button
                                className={'nav-toggle'}
                                disabled={nav.mode === 'iat'}
                                icon={nav.toggle ? 'hopenleft' : 'hcloseleft'}
                                title={nav.toggle ? 'Minimize navigator.' : 'Maximize navigator'}
                                onClick={() => {
                                    setPref('navToggle', !nav.toggle);
                                    nav.setToggle(!nav.toggle);
                                    nav.setResize(true);
                                }}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'tree'}
                                label={!nav.offCanvas ? 'List' : ''}
                                title={`View navigation tree.`}
                                onClick={() => {
                                    setMode('tree')
                                    nav.scroll(true);
                                }}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'map'}
                                label={!nav.offCanvas ? 'Map' : ''}
                                title={`View navigation map.`}
                                onClick={() => setMode('map')}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'filter'}
                                label={!nav.offCanvas ? 'Filter' : ''}
                                title={`Filter map stations.`}
                                className={nav.hasFilter ? 'active' : ''}
                                onClick={() => dialog.setCurrent({dialogID: 'filter'})}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'search'}
                                label={!nav.offCanvas ? 'Search' : ''}
                                title={`Full-text search of metadata.`}
                                onClick={() => setMode('search')}
                            />
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

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
    const {isAdmin=false, isEditor=false} = user || {};

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
                            compact={nav.offCanvas}
                            label={'New'}
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
                <li className={'push'}>
                    <Button
                        icon={'sync'}
                        label={nav.offCanvas ? '' : 'Refresh'}
                        onClick={_handleRefresh}
                    />
                </li>
                <li className={user ? '' : 'push'} key={`${menuID}_menuitem_iat`}>
                    <Button
                        icon={'iat'}
                        label={nav.offCanvas ? '' : 'Toolkit'}
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
                        label={nav.offCanvas ? '': 'Export'}
                        title={`View data export options.`}
                        onClick={() => {
                            dialog.setCurrent({dialogID: 'exporter'});
                        }}
                    />
                </li>
                <li key={`${menuID}_menuitem_help`}>
                    <Button
                        icon={'help'}
                        label={nav.offCanvas ? '' : 'Help'}
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
                            label={nav.offCanvas ? '': 'Options'}
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
