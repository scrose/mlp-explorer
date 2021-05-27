/*!
 * MLP.Client.Tools.IAT.Canvas
 * File: canvas.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { scaleToFit } from './transform.iat';
import { eraseOverlay } from './graphics.iat';

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
            source_dims: {
                x: 0, y: 0,
                w: properties.original_dims.w,
                h: properties.original_dims.h,
            },
            image_dims: {
                x: 0,
                y: 0,
                w: properties.original_dims.w,
                h: properties.original_dims.h,
            },
            render_dims: {
                x: 0,
                y: 0,
                w: properties.original_dims.w,
                h: properties.original_dims.h,
            },
        },
    });
};

/**
 * Resets image data to source data but keeps current render dimensions.
 *
 * @public
 * @param properties
 * @param callback
 */

export const undo = async (properties, callback) => {
    callback({
        status: 'reset',
        props: {},
    });
};

/**
 * Erase control points.
 *
 * @public
 * @param properties
 * @param callback
 */

export const erase = async (properties, callback) => {
    callback({
        status: 'draw',
        draw: eraseOverlay,
        props: { pts: [] }
    });
};

/**
 * Fit image to canvas
 *
 * @public
 * @param properties
 * @param callback
 */

export const fit = async (properties, callback) => {

    // compute scaled dimensions
    const dims = scaleToFit(
            properties.image_dims.w,
            properties.image_dims.h,
            properties.base_dims.w,
            properties.base_dims.h,
        );

    // update panel properties
    return callback({
        status: 'view',
        props: {
            render_dims: {
                x: 0,
                y: 0,
                w: dims.w,
                h: dims.h
            },
        },
    });
};

/**
 * Expand to full-sized image.
 *
 * @public
 * @param properties
 * @param callback
 */

export const expand = async (properties, callback) => {
    return callback({
        status: 'view',
        props: {
            render_dims: {
                x: 0,
                y: 0,
                w: properties.image_dims.w,
                h: properties.image_dims.h
            },
        }
    });
};
