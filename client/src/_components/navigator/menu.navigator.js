/*!
 * MLP.Client.Components.Menus.Navigator
 * File: menu.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React  from 'react';
import Button from '../common/button';
import { setNavView, setPref } from '../../_services/session.services.client';
import HelpView from '../views/help.view';

/**
 * Navigator menu component.
 *
 * @param view
 * @param set
 * @param setData
 * @param toggle
 * @param setToggle
 * @param setDialog
 * @param filtered
 * @public
 */

const MenuNavigator = ({
                           view,
                           set,
                           setData,
                           toggle,
                           setToggle,
                           setDialog,
                           filtered
}) => {

    // Sets the current navigation view (tree/map)
    // - set in state and persistent session variable
    const setView = (navView) => {
        // reset node data
        setData(null);
        // toggle navigator
        setToggle(true);
        setPref('navToggle', true);
        // set navigator view
        set(navView);
        setNavView(navView);
    }

    return (
        <div className={'navigator-tools'}>
            <div className={toggle ? 'h-menu' : 'v-menu'}>
                <ul className={`v-menu`}>
                    <li>
                        <Button
                            disabled={view === 'iat'}
                            icon={toggle ? 'hopenleft' : 'hcloseleft'}
                            title={toggle ? 'Minimize navigator.' : 'Maximize navigator'}
                            onClick={() => {
                                setToggle(!toggle);
                                setPref('navToggle', !toggle);
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            icon={'tree'}
                            label={ toggle ? 'List' : ''}
                            className={view === 'tree' ? 'active' : ''}
                            title={`View navigation tree.`}
                            onClick={() => setView('tree')}
                        />
                    </li>
                    <li>
                        <Button
                            icon={'map'}
                            label={toggle ? 'Map' : ''}
                            className={view === 'map' ? 'active' : ''}
                            title={`View navigation map.`}
                            onClick={() => setView('map')}
                        />
                    </li>
                    {
                        view === 'map' && <li>
                                <Button
                                    icon={'filter'}
                                    label={toggle ? 'Filter' : ''}
                                    className={filtered ? 'active' : ''}
                                    title={`Filter map stations.`}
                                    onClick={() => setDialog({ type: 'filter' })}
                                />
                              </li>
                    }
                    <li>
                        <Button
                            icon={'search'}
                            label={toggle ? 'Search' : ''}
                            className={view === 'search' ? 'active' : ''}
                            title={`Full-text search of metadata.`}
                            onClick={() => setView('search')}
                        />
                    </li>
                    <li>
                        <Button
                            icon={'help'}
                            label={toggle ? 'Help' : ''}
                            title={`View navigator help pages.`}
                            onClick={() => setDialog({ type: 'help' })}
                        />
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default React.memo(MenuNavigator);
