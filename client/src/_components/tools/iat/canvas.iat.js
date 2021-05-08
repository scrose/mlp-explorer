/*!
 * MLP.Client.Tools.IAT.Canvas
 * File: canvas.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { scaleToFit } from './transform.iat';

/**
 * Resets data layer to source data.
 *
 * @private
 */

export const reset = async (properties, options, callback) => {

    // get default dimensions
    const defaultDims = {
        x: Math.min(properties.source_dims.x, options.defaultX),
        y: Math.min(properties.source_dims.y, options.defaultY),
    };

    // update panel properties
    callback({
        status: 3,
        props: {
            render_dims: {
                x: properties.source_dims.x,
                y: properties.source_dims.y,
            },
            data_dims: defaultDims,
            offset: { x: 0, y: 0 },
            move: { x: 0, y: 0 },
            origin: { x: 0, y: 0 },
            pts: [],
        },
    });
};

/**
 * Erase canvas.
 *
 * @private
 */

export const erase = async (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Fit image to canvas
 *
 * @public
 * @return dimensions
 */

export const fit = async (properties, callback) => {

    // compute scaled dimensions
    const dims = scaleToFit(
        properties.source_dims.x,
        properties.source_dims.y,
        properties.base_dims.x,
    );

    // update panel properties
    return callback({
        status: 2,
        props: {
            offset: { x: 0, y: 0 },
            data_dims: dims,
            render_dims: dims,
            pts: [],
        },
    });
};

/**
 * Expand to full-sized image.
 *
 * @return dimensions
 */

export const expand = async (properties, callback) => {
    return callback({
        status: 2,
        props: {
            render_dims: {
                x: properties.source_dims.x,
                y: properties.source_dims.y,
            },
            pts: [],
        }
    });
};
