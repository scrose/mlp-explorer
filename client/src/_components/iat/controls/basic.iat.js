/*!
 * MLP.Client.Tools.IAT.Basic
 * File: basic.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import {scaleToFit} from './transform.iat';

/**
 * Resets image data to source data.
 *
 * @public
 * @param properties
 * @param callback
 */

export const reset = async (properties, callback) => {
    callback({
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
        status: 'clear',
        props: {},
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
    return callback({ x: 0, y: 0, w: dims.w, h: dims.h });
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

/**
 * Update render dimensions for zoom-in
 *
 * @public
 * @param dims
 */

export const zoomIn = (dims) => {
    return {
        x: Math.round(dims.x * 1.1),
        y: Math.round(dims.y * 1.1),
        w: Math.round(dims.w * 1.1),
        h: Math.round(dims.h * 1.1)
    }
};

/**
 * Update render dimensions for zoom-out
 *
 * @public
 */

export const zoomOut = (dims) => {
    return {
        x: Math.round(dims.x / 1.1),
        y: Math.round(dims.y / 1.1),
        w: Math.round(dims.w / 1.1),
        h: Math.round(dims.h / 1.1)

    };
};

