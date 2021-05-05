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

export const Magnifier = ({ enable=false, pointer, panel, options})  => {

    // canvas magnifier reference
    const magnifierRef = React.useRef(null);

    const [startPt, setStartPt] = React.useState(null);

    React.useEffect(() => {

        /**
         * Initialize magnifier. Sets background properties
         * for the magnifier.
         *
         * @private
         */

        async function _init () {
            const bgSizeX = panel.base_dims.x * options.magnifyZoom;
            const bgSizeY = panel.base_dims.y * options.magnifyZoom;
            const w = magnifierRef.current.offsetWidth / 2;
            const h = magnifierRef.current.offsetHeight / 2;
            magnifierRef.current.style.left = (pointer.x - w) + 'px';
            magnifierRef.current.style.top = (pointer.y - h) + 'px';
            magnifierRef.current.style.backgroundImage = `url('${panel.dataURL}')`;
            magnifierRef.current.style.backgroundSize = `${bgSizeX}px ${bgSizeY}px`;
        }

        /**
         * Image region magnifier.
         * Reference: https://www.w3schools.com/howto/howto_js_image_magnifier_glass.asp
         *
         * @public
         * @param x
         * @param y
         */

        const _magnify = (x, y) => {

            // set magnification parameters
            const zoom = options.magnifyZoom;
            const bw = 3;
            const w = magnifierRef.current.offsetWidth / 2;
            const h = magnifierRef.current.offsetHeight / 2;
            magnifierRef.current.style.left = (x - w) + 'px';
            magnifierRef.current.style.top = (y - h) + 'px';

            /* Display what the magnifier glass "sees": */
            magnifierRef.current.style.backgroundPosition =
                '-' + ((x * zoom) - w + bw) + 'px -' + ((y * zoom) - h + bw) + 'px';
        };

        if (enable) {
            _magnify(pointer.x, pointer.y);
        }
        else {
            magnifierRef.current.style.backgroundImage = '';
            magnifierRef.current.style.backgroundSize = '';
        }

    }, [enable, pointer, panel, options])


    // render canvas magnifier
    return <div
            ref={magnifierRef}
            className={`canvas-magnifier${!enable ? ' hidden' : ''}`}
           />
};

export default Magnifier;
