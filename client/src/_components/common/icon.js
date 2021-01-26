/*!
 * MLP.Client.Components.Common.Icon
 * File: icon.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Select icon class. Uses FontAwesome icon library.
 * Reference: https://fontawesome.com/
 *
 * @public
 */

const getIconClass = (iconType) => {
    const iconComponents = {
        home: 'fas fa-lg fa-home',
        user: 'fas fa-lg fa-user-circle',
        info: 'fas fa-lg fa-info-circle',
        add: 'fas fa-lg fa-plus',
        edit: 'fas fa-lg fa-edit',
        delete: 'fas fa-lg fa-trash-alt',
        logo: 'fas fa-mountain',
        map: 'fas fa-lg fa-map-marked-alt',
        tree: 'fas fa-lg fa-list',
        up: 'fas fa-lg fa-chevron-circle-up',
        down: 'fas fa-lg fa-chevron-circle-down',
        default: 'fas fa-lg fa-square'
    };
    return iconComponents.hasOwnProperty(iconType)
        ? iconComponents[iconType]
        : iconComponents.default
}

/**
 * Render icon component.
 *
 * @public
 */

const Icon = ({type}) => {
    return (
        <i className={getIconClass(type)} />
    );
}

export default Icon;
