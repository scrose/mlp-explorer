/*!
 * MLP.Client.Components.Common.Heading
 * File: heading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { capitalize } from '../../_utils/data.utils.client';

/**
 * Render view heading component.
 *
 * @public
 */

const Heading = ({model='', text = ''}) => {
    const prefix = model ? `${capitalize(model)}: ` : '';

    return <h3>{`${prefix}${text}`}</h3>
}

export default Heading;
