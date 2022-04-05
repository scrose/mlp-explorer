/*!
 * MLP.Client.Tools.IAT.Magnifier
 * File: iat.magnifier.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import crosshair from '../svg/crosshair.svg';

/**
 * Defines download local file button. Expects callback to retrieve data
 * as Blob for the selected file format.
 *
 * @public
 * @param enable
 * @param pointer
 * @param properties
 * @param options
 * @return {JSX.Element}
 */

export const Magnifier = ({ canvas, pointer, properties, options }) => {

    // canvas magnifier reference
    const magnifierRef = React.useRef(null);
    const crosshairRef = React.useRef(null);

    /**
     * Image region magnifier.
     * Reference: https://www.w3schools.com/howto/howto_js_image_magnifier_glass.asp
     *
     * @public
     * @param x
     * @param y
     */

    React.useEffect(() => {

        const zoom = options.magnifyZoom;
        const w = magnifierRef.current.offsetWidth / 2;
        const h = magnifierRef.current.offsetHeight / 2;

        /**
         * Initialize magnifier. Sets background properties
         * for the magnifier.
         *
         * @private
         */

        function _init() {
            if (!magnifierRef.current.style.backgroundImage) {
                // load data url from canvas
                const bgDataURL = canvas.toDataURL('image/jpeg', 1.0);
                // set magnification parameters
                const bgSizeX = properties.base_dims.w * options.magnifyZoom;
                const bgSizeY = properties.base_dims.h * options.magnifyZoom;

                // update crosshair style properties
                crosshairRef.current.style.left = (pointer.x - w) + 'px';
                crosshairRef.current.style.top = (pointer.y - h) + 'px';
                crosshairRef.current.style.backgroundImage = `url('${crosshair}')`;

                // update magnifier style properties
                magnifierRef.current.style.left = (pointer.x - w) + 'px';
                magnifierRef.current.style.top = (pointer.y - h) + 'px';
                magnifierRef.current.style.backgroundImage = `url('${bgDataURL}')`;
                magnifierRef.current.style.backgroundSize = `${bgSizeX}px ${bgSizeY}px`;
                magnifierRef.current.style.visibility = 'visible';
            }
        }

        // apply magnifier over region
        if (pointer.magnify && pointer.x !== 0 && pointer.y !== 0) {
            _init();

            const x = pointer.x;
            const y = pointer.y;

            magnifierRef.current.style.left = (x - w) + 'px';
            magnifierRef.current.style.top = (y - h) + 'px';

            crosshairRef.current.style.left = (x - w) + 'px';
            crosshairRef.current.style.top = (y - h) + 'px';

            /* Display what the magnifier glass "sees": */
            magnifierRef.current.style.backgroundPosition =
                '-' + ((x * zoom) - w) + 'px -' + ((y * zoom) - h) + 'px';
        } else {
            magnifierRef.current.style.backgroundImage = '';
            magnifierRef.current.style.backgroundSize = '';
            magnifierRef.current.style.visibility = 'hidden';
        }

    }, [canvas, pointer, properties, options]);


    // render canvas magnifier
    return <>
        <div
            ref={crosshairRef}
            className={`canvas-magnifier-crosshair`}
        />
        <div
            ref={magnifierRef}
            className={`canvas-magnifier`}
        />
    </>;
};

export default Magnifier;
