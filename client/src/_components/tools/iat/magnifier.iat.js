/*!
 * MLP.Client.Tools.IAT.Magnifier
 * File: iat.magnifier.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';

/**
 * Defines download local file button. Expects callback to retrieve data
 * as Blob for the selected file format.
 *
 * @public
 * @param enable
 * @param pointer
 * @param panel
 * @param options
 * @return {JSX.Element}
 */

export const Magnifier = ({ pointer, panel, options, offset})  => {

    // canvas magnifier reference
    const magnifierRef = React.useRef(null);

    const [startPt, setStartPt] = React.useState(offset);

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

        function _init () {
            if (!magnifierRef.current.style.backgroundImage) {
                // set magnification parameters
                const bgSizeX = panel.props.base_dims.x * options.magnifyZoom;
                const bgSizeY = panel.props.base_dims.y * options.magnifyZoom;
                magnifierRef.current.style.left = (pointer.x - w) + 'px';
                magnifierRef.current.style.top = (pointer.y - h) + 'px';
                magnifierRef.current.style.backgroundImage = `url('${panel.props.dataURL}')`;
                magnifierRef.current.style.backgroundSize = `${bgSizeX}px ${bgSizeY}px`;
            }
        }

        // apply magnifier over region
        if (pointer.magnify) {
            _init();

            const x = pointer.x;
            const y = pointer.y;

            magnifierRef.current.style.left = (x - w) + 'px';
            magnifierRef.current.style.top = (y - h) + 'px';

            /* Display what the magnifier glass "sees": */
            magnifierRef.current.style.backgroundPosition =
                '-' + ((x * zoom) - w) + 'px -' + ((y * zoom) - h) + 'px';
        }
        else {
            magnifierRef.current.style.backgroundImage = '';
            magnifierRef.current.style.backgroundSize = '';
        }

    }, [pointer, panel, options])


    // render canvas magnifier
    return <div
            ref={magnifierRef}
            className={`canvas-magnifier${!pointer.magnify ? ' hidden' : ''}`}
           />
};

export default Magnifier;
