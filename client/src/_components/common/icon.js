/*!
 * MLP.Client.Components.Common.Icon
 * File: icon.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Select icon class.
 *
 * @public
 */

const getIconClass = (iconType) => {
    const iconComponents = {
        home: 'fa fa-lg fa-home',
        default: 'fa fa-lg fa-square'
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
