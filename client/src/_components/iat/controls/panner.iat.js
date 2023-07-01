/*!
 * MLP.Client.IAT.Translator
 * File: translator.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * Adapted from IAT web application
 * MIT Licensed
 */

/**
 * Set mouse start position on canvas.
 *
 * @public
 * @param e
 * @param properties
 * @param options
 * @param pointer
 */

export function moveStart(e, properties, pointer, options) {
    e.preventDefault();
}

/**
 * Reset pointer selection.
 *
 * @public
 * @param e
 * @param properties
 * @param options
 * @param pointer
 */

export function moveEnd(e, properties, pointer, options) {
    e.preventDefault();
    pointer.setSelect(null);
}

/**
 * Update canvas offset by cursor position
 * @param e
 * @param properties
 * @param pointer
 * @param options
 * @param callback
 */

export function moveAt(e, properties, pointer, options, callback) {

    // check that mouse start position was selected
    if (!pointer.selected) return;

    e.preventDefault();

    // compute distance traveled
    const _x = properties.render_dims.x + pointer.x - pointer.selected.x;
    const _y = properties.render_dims.y + pointer.y - pointer.selected.y;

    // update the pointer selected point
    pointer.setSelect({ x: pointer.x, y: pointer.y });

    // update image offset coordinate
    callback({
        status: 'view',
        props: {
            render_dims: {
                w: properties.render_dims.w,
                h: properties.render_dims.h,
                x: _x,
                y: _y,
            },
        },
    });
}

/**
 * Update canvas offset by dx/dy
 * @param e
 * @param properties
 * @param dx
 * @param dy
 * @param callback
 */

export function moveBy(e, properties, dx = 0, dy = 0, callback) {
    e.preventDefault();
    return callback(
        {
            status: 'render',
            props: {
                render_dims: {
                    w: properties.render_dims.w,
                    h: properties.render_dims.h,
                    x: properties.render_dims.x + dx,
                    y: properties.render_dims.y + dy,
                },
            },
        });
}