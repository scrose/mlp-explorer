/*!
 * MLP.Client.Tools.IAT.Canvas
 * File: canvas.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { loadCanvas, loadRenderLayer, toImageData } from './load.iat';
import { scaleToFit } from './transform.iat';

// our second custom hook: a composition of the first custom hook and React's useEffect + useRef
export function useRenderCanvas(imgData) {
    const canvasRef = React.useRef(null);
    React.useEffect(() => {
        if (imgData) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // load data to render layer
            ctx.putImageData(imgData, 0, 0);
        }
    })
    return [canvasRef]
}

/**
 * Redraws image data to canvas
 * Note: Scale sets new data canvas dimensions
 * - dx
 *   The x-axis coordinate in the destination canvas at which to place the top-left
 *   corner of the source image.
 * - dy
 *   The y-axis coordinate in the destination canvas at which to place the top-left
 *   corner of the source image.
 * - dWidth
 *   The width to draw the image in the destination canvas. This allows scaling of the
 *   drawn image. If not specified, the image is not scaled in width when drawn.
 * - dHeight
 *   The height to draw the image in the destination canvas. This allows scaling of
 *   the drawn image. If not specified, the image is not scaled in height when drawn.
 *
 * @private
 */

export const redraw = async (layers, offset, dims, baseDims) => {

    // reject uninitialized elements
    if (!layers.loaded()) return;

    console.log('Redraw!')

    const dataCanvas = layers.data();
    const renderCanvas = layers.render();

    // get data layer dims (upper limit is the base canvas)
    const dWidth = Math.min(dims.x, baseDims.x);
    const dHeight = Math.min(dims.y, baseDims.y);

    console.log('Data canvas:', dataCanvas.width, dataCanvas.height)

    // clear data layer canvas
    const ctx = dataCanvas.getContext('2d');
    ctx.clearRect(0, 0, dataCanvas.width, dataCanvas.height);

    // draw image to data layer canvas
    //ctxData.imageSmoothingQuality = 'high';
    ctx.drawImage(renderCanvas, offset.x, offset.y, dWidth, dHeight);

};

/**
 * Reloads data layer from input data.
 *
 * @private
 */

export const reload = async() => {
    return null;
}

/**
 * Resets data layer to source data.
 *
 * @private
 */

export const reset = async (layers, panel, source, setImage, options) => {

    // reject uninitialized elements
    if (!layers.loaded()) return;

    // get default dimensions
    const defaultDims = {
        x: Math.min(source.width, options.defaultX),
        y: Math.min(source.height, options.defaultY),
    };

    setImage(toImageData(source.data, source.width, source.height));
    const rendered = loadCanvas(layers.render(), source, defaultDims.x, defaultDims.y);
    loadCanvas(layers.data(), rendered, defaultDims.x, defaultDims.y);

    // update panel properties
    panel.update({
        render_dims: { x: source.width, y: source.height },
        data_dims: defaultDims,
        offset: { x: 0, y: 0 },
        move: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        pts: [],
    });
}

/**
 * Erase canvas.
 *
 * @private
 */

export const erase = async (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Fit image to canvas
 *
 * @private
 */

export const fit = async (layers, panel) => {

    console.log('Fit to canvas!')

    // compute scaled dimensions
    const dims = scaleToFit(
        panel.props.source_dims.x,
        panel.props.source_dims.y,
        panel.props.base_dims.x,
    );

    await redraw(layers, panel.props.offset, dims, panel.props.base_dims);

    console.log(dims, panel.props.base_dims)

    // update panel properties
    panel.update({
        offset: { x: 0, y: 0 },
        data_dims: dims,
        pts: [],
        dataURL: layers.data().toDataURL()
    });
}
