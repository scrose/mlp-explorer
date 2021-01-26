/*!
 * MLP.Client.Components.Navigator
 * File: navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Icon from '../common/icon';
import NavigatorMenu from '../menus/navigator.menu';
import TreeNavigator from './tree.navigator';
import MapNavigator from './map.navigator';

/**
 * Map navigator component.
 *
 * @public
 * @return {JSX.Element}
 */

const Navigator = () => {

    // initialize navigation view
    const [navView, setNavView] = React.useState('tree');

    return (
        <div className={'navigator'}>
            <NavigatorMenu view={navView} set={setNavView} />
            {navView === 'tree' ? <TreeNavigator/> : <MapNavigator/>}
        </div>
    )
}

export default Navigator;