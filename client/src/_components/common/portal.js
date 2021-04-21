/*!
 * MLP.Client.Components.Common.Portal
 * File: portal.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { createPortal } from 'react-dom';
import usePortal from '../../_providers/portal.provider.client';

/**
 * @example
 * <Portal id="modal">
 *   <p>Thinking with portals</p>
 * </Portal>
 */

const Portal = ({ id, children }) => {
    const target = usePortal(id);
    return createPortal(
        children,
        target,
    );
};

export default Portal;