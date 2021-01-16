/*!
 * MLP.Client.Components.Common.Brand
 * File: icon.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import { getPageHeading } from '../../_services/schema.services.client';

/**
 * Render branding heading.
 *
 * @public
 */

const Brand = () => {
    return (
        <h1>
            <a href={getRoot()}>{getPageHeading()}</a>
        </h1>
    );
}

export default Brand;
