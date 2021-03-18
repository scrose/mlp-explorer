/*!
 * MLP.Client.Components.Views.IAT
 * File: aligner.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import AlignerMenu from '../menus/aligner.menu';

/**
 * IAT (Image Analysis Toolkit) wrapper.
 *
 * NOTES:
 * FILE: Adapted from iat.html
 *
 * @param image1
 * @param image2
 * @public
 */

const Canvas = ({data}) => {
    return <canvas id={''} />

}

/**
 * Image aligner wrapper.
 *
 * @param data
 * @param route
 * @param callback
 * @public
 */

const Aligner = ({data, route, callback}) => {

    // set canvas dimensions
    const [canvasDims, setCanvasDims] = React.useState({
        canvas1Width: 0.5,
        canvas2Width: 0.0,
        canvas3Width: 0.5
    });
    const {canvas1Width=0.5, canvas2Width=0.0, canvas3Width=0.5} = canvasDims || {};

    return (
        <div className={'iat'}>
            <AlignerMenu data={''} />
            <Canvas width={canvas1Width} className={'iat-canvas-left'} />
            <Canvas width={canvas2Width} className={'iat-canvas-middle'} />
            <Canvas width={canvas3Width} className={'iat-canvas-right'} />
        </div>
    )
}

export default React.memo(Aligner);


