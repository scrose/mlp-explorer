/*!
 * MLP.Client.IAT.Transform
 * File: transform.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * Adapted from IAT web application
 * MIT Licensed
 */

/**
 * Computes scale-to-fit dimensions to fit an image [ix, iy]
 * inside a canvas [cx, cy].
 *
 *
 * @public
 * @return {Object} dimensions
 */

export const scaleToFit = (ix, iy, cx, cy) => {
    const ri = ix / iy;
    const rc = cx / cy;
    return {
        w: Math.floor(rc > ri ? ix * cy/iy : cx),
        h: Math.floor(rc > ri ? cy : iy * cx/ix)
    };
};

/**
 * Returns in-range function for 2D coordinate.
 *
 * @public
 * @param x
 * @param y
 * @param u
 * @param v
 * @param radius
 */

export function inRange(x, y, u, v, radius) {
    return (u - (x + radius)) * (u - (x - radius)) < 0
        && (v - (y + radius)) * (v - (y - radius)) < 0;
}

/**
 * Get the current image scaling factors.
 *
 * @public
 * @param properties
 */

export const getScale = (properties) => {

    // compute image scaling coefficient
    const eps = 0.0000000001;
    return {
        x: properties.render_dims.w > 0
            ? ((properties.image_dims.w + eps) / (properties.render_dims.w + eps)).toFixed(2)
            : 1.0,
        y: properties.render_dims.h > 0
            ? ((properties.image_dims.h + eps) / (properties.render_dims.h + eps)).toFixed(2)
            : 1.0
    }
}

/**
 * Scale coordinate by image resize dimensions.
 *
 * @public
 * @param pt
 * @param properties
 */

export const scalePoint = (pt, properties) => {

    // get image scaling coefficient
    const scale = getScale(properties);

    // compute actual pixel position in image
    return {
        x: Math.ceil(pt.x * scale.x),
        y: Math.ceil(pt.y * scale.y)
    };
}

/**
 * Scale width of larger image to match smaller.
 *
 * @public
 * @param controlPanel
 * @param responsePanel
 * @param setPanelControl
 * @param setPanelResponse
 */

export const scaleToMatch = (controlPanel, responsePanel, setPanelControl, setPanelResponse) => {
    const eps = 0.00000001;
    // scale dimensions of response panel to match control panel
    const updatedDims = scaleToFit(
        responsePanel.image_dims.w,
        responsePanel.image_dims.h,
        controlPanel.image_dims.w,
        controlPanel.image_dims.h
    );
    // compute scaled control height
    const updatedControlH = Math.round(
        controlPanel.image_dims.h * (updatedDims.w + eps) / (controlPanel.image_dims.w + eps))

    // load transformed data into control panel
    setPanelControl(data => ({
        ...data,
        image_dims: {
            w: updatedDims.w,
            h: updatedControlH
        },
        source_dims: {
            w: controlPanel.image_dims.w,
            h: controlPanel.image_dims.h,
            x: 0,
            y: 0
        },
        render_dims: {
            w: updatedDims.w,
            h: updatedDims.h,
            x: 0,
            y: 0
        }
    }));
    // load transformed data into response panel
    setPanelResponse(data => ({
        ...data,
        image_dims: {
            w: updatedDims.w,
            h: updatedDims.h
        },
        source_dims: {
            w: responsePanel.image_dims.w,
            h: responsePanel.image_dims.h,
            x: 0,
            y: 0
        },
        render_dims: {
            w: updatedDims.w,
            h: updatedDims.h,
            x: 0,
            y: 0
        }
    }));
}