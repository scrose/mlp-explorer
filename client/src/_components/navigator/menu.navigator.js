/*!
 * MLP.Client.Components.Menus.Navigator
 * File: menu.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React, { useCallback } from 'react';
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

    // dropdown toggle for tools menu items
    const [dropdownToggle, setDropdownToggle] = React.useState(false);

    // Initialize map using reference callback to access DOM
    const dropdown = useCallback(domNode => {

        // create hide dropdown function
        const hideDropdown = (e) => {
            if (!domNode.contains(e.target)) {
                setDropdownToggle(false);
                document.removeEventListener('click', hideDropdown);
            }
        };

        // create event listener to close menu upon click
        if (domNode && dropdownToggle) {
            document.addEventListener('click', hideDropdown);
        } else {
            document.removeEventListener('click', hideDropdown);
        }

    }, [dropdownToggle, setDropdownToggle]);

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
        // open navigator menu
        setDropdownToggle(false);
    }

    return (
        <div className={'navigator-tools'}>
            <div className={toggle ? 'h-menu' : 'v-menu'}>
                <ul className={`v-menu`}>
                    <li>
                        <Button
                            icon={toggle ? 'hopenleft' : 'hcloseleft'}
                            title={`Minimize the navigator.`}
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
