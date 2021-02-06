/*!
 * MLP.Client.Components.Common.Image
 * File: file.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Defines file component.
 *
 * @public
 * @return {React.Component}
 */

const File = ({ uri='/logo192.png', type, scale='thumb', title='', alt='' }) => {
    return <img
        src={uri}
        className={`${type} ${scale}`}
        alt={alt}
        title={title}
    />;
}

export default React.memo(File);
