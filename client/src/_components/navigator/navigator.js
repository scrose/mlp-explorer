/*!
 * MLP.Client.Components.Navigator
 * File: navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import MenuNavigator from '../menus/navigator.menu';
import TreeNavigator from './tree.navigator';
import MapNavigator from './map.navigator';

/**
 * Main navigator component.
 *
 * @public
 * @return {JSX.Element}
 */

const Navigator = () => {

    // initialize navigation view
    const [navView, setNavView] = React.useState('tree');

    // menu visibility state
    const [menuToggle, setMenuToggle] = React.useState(false);

    return (
        <div className={'navigator'}>
            <MenuNavigator
                view={navView}
                set={setNavView}
                toggle={menuToggle}
                setToggle={setMenuToggle}
            />
            {navView === 'tree'
                ? <TreeNavigator setMenu={setMenuToggle} />
                : <MapNavigator/>}
        </div>
    )
}

export default React.memo(Navigator);