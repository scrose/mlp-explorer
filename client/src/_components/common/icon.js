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
        user: 'fas fa-3x fa-user-circle',
        logo: 'fas fa-2x fa-mountain',
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
