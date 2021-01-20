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

const Heading = ({model='Records', text = 'View'}) => {

    return <h3>{`${text}: ${capitalize(model)}`}</h3>
}

export default Heading;
