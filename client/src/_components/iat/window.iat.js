/*!
 * MLP.Client.Tools.IAT.Window
 * File: window.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React, { useLayoutEffect, useState } from 'react';

/**
 * Hook listens to the window resize event.
 *
 * @public
 */

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

export default useWindowSize;