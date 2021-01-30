/*!
 * MLP.Client.Components.Menus.Navigator
 * File: editor.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';

/**
 * Navigator menu component.
 *
 * @public
 */

const MenuNavigator = ({view, set}) => {
    return (
        <div className={'navigator-tools h-menu'}>
            <ul>
                <li>
                    <button
                        title={`View navigation tree.`}
                        onClick={() => set('tree')}
                    >
                        <Icon type={'tree'} /> <span>Tree View</span>
                    </button>
                </li>
                <li>
                    <button
                        title={`View navigation map.`}
                        onClick={() => set('map')}
                    >
                        <Icon type={'map'} /> <span>Map View</span>
                    </button>
                </li>
            </ul>
        </div>
    )
}

export default React.memo(MenuNavigator);
