/*!
 * MLP.Client.Tools.IAT.Canvas
 * File: canvas.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { scaleToFit } from './transform.iat';

/**
 * Resets image data to source data.
 *
 * @public
 * @param properties
 * @param callback
 */

export const reset = async (properties, callback) => {
    callback({
        status: 'reset',
        props: {
            image_dims: {
                x: properties.source_dims.x,
                y: properties.source_dims.y,
            },
            render_dims: {
                x: properties.source_dims.x,
                y: properties.source_dims.y,
            },
            crop_dims: properties.base_dims,
            offset: { x: 0, y: 0 },
            move: { x: 0, y: 0 },
            origin: { x: 0, y: 0 },
            pts: [],
        },
    });
};

/**
 * Erase control points.
 *
 * @private
 */

export const erase = async (callback) => {
    callback({
        status: 'redraw',
        props: { pts: [] }
    });
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
            properties.image_dims.x,
            properties.image_dims.y,
            properties.base_dims.x,
            properties.base_dims.y,
        );

    // update panel properties
    return callback({
        status: 'render',
        props: {
            offset: { x: 0, y: 0 },
            crop_dims: dims,
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
        status: 'render',
        props: {
            render_dims: properties.image_dims,
            crop_dims: properties.base_dims,
            pts: [],
        }
    });
};
