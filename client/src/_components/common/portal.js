/*!
 * MLP.Client.Components.Common.Portal
 * File: portal.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import usePortal from '../../_providers/portal.provider.client';

/**
 * @example
 * <Portal id="modal">
 *   <p>Thinking with portals</p>
 * </Portal>
 */

const Portal = ({ id, children }) => {
    const target = usePortal(id);
    return <div>Not Available</div>
};

export default Portal;