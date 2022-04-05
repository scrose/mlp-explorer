/*!
 * MLP.Client.Components.Navigation.Navigator
 * File: menu.navigator.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React  from 'react';
import Button from '../common/button';
import { setNavView, setPref } from '../../_services/session.services.client';
import HelpView from '../views/help.view';
import Dialog from "../common/dialog";
import FilterMapNavigator from "../navigator/filter.map.navigator";
import Mover from "../views/mover.view";
import {useNav} from "../../_providers/nav.provider.client";
import {createNodeRoute, redirect } from "../../_utils/paths.utils.client";

/**
 * Navigator menu component.
 *
 * @public
 */

const NavigatorMenu = () => {

    const nav = useNav();

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
            {
                nav.dialog === 'filter' &&
                <Dialog title={`Filter Map Stations`} setToggle={nav.setDialog}>
                    <FilterMapNavigator/>
                </Dialog>
            }
            {
                nav.dialog === 'move' && <Mover
                    callback={(error, response)=>{
                        nav.setDialog(null);
                        const {id='', type=''} = response || {};
                        // redirect to moved node
                        if (!error && id && type) {
                            redirect(createNodeRoute(type, 'show', id));
                        }
                    }}
                    onCancel={() => {nav.setDialog(null)}} />
            }
            {
                nav.dialog === 'help' &&
                <HelpView page={2} section={0} setToggle={nav.setDialog} />
            }
            <div className={'navigator-tools'}>
                <div className={'h-menu'}>
                    <ul className={`v-menu`}>
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
                                onClick={() => setMode('tree')}
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
                                onClick={() => nav.setDialog('filter')}
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
                        <li>
                            <Button
                                icon={'help'}
                                label={!nav.offCanvas ? 'Help' : ''}
                                title={`View navigator help pages.`}
                                onClick={() => nav.setDialog('help')}
                            />
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default React.memo(NavigatorMenu);
