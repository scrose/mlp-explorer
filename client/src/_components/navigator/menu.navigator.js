/*!
 * MLP.Client.Components.Menus.Navigator
 * File: menu.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React  from 'react';
import Button from '../common/button';
import { setNavView } from '../../_services/session.services.client';

/**
 * Navigator menu component.
 *
 * @param view
 * @param set
 * @param setData
 * @param toggle
 * @param setToggle
 * @param setFilter
 * @param filtered
 * @public
 */

const MenuNavigator = ({
                           view,
                           set,
                           setData,
                           toggle,
                           setToggle,
                           setFilter,
                           filtered
}) => {

    // Sets the current navigation view (tree/map)
    // - set in state and persistent session variable
    const setView = (navView) => {
        // reset node data
        setData(null);
        // toggle navigator
        setToggle(true);
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
                            icon={toggle ? 'hopenleft' : 'hcloseleft'}
                            title={toggle ? 'Minimize navigator.' : 'Maximize navigator'}
                            onClick={() => setToggle(!toggle)}
                        />
                    </li>
                    <li>
                        <Button
                            icon={'tree'}
                            className={view === 'tree' ? 'active' : ''}
                            title={`View navigation tree.`}
                            onClick={() => setView('tree')}
                        />
                    </li>
                    <li>
                        <Button
                            icon={'map'}
                            className={view === 'map' ? 'active' : ''}
                            title={`View navigation tree.`}
                            onClick={() => setView('map')}
                        />
                    </li>
                    {
                        view === 'map'
                            ? <li>
                                <Button
                                    icon={'filter'}
                                    className={filtered ? 'active' : ''}
                                    title={`Filter map stations.`}
                                    onClick={() => setFilter(true)}
                                />
                              </li>
                            : ''
                    }
                    <li>
                        <Button
                            icon={'search'}
                            className={view === 'search' ? 'active' : ''}
                            title={`Full-text search of metadata.`}
                            onClick={() => setView('search')}
                        />
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default React.memo(MenuNavigator);
