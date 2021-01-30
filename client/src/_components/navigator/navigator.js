/*!
 * MLP.Client.Components.Navigator
 * File: navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import MenuNavigator from './menu.navigator';
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

    return (
        <div className={'navigator'}>
            <MenuNavigator view={navView} set={setNavView} />
            {navView === 'tree' ? <TreeNavigator/> : <MapNavigator/>}
        </div>
    )
}

export default React.memo(Navigator);