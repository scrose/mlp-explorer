/*!
 * MLP.Client.IAT.Transform
 * File: transform.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
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
        w: Math.round(rc > ri ? ix * cy/iy : cx),
        h: Math.round(rc > ri ? cy : iy * cx/ix)
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
 * @param sourceDims
 * @param targetDims
 */

export const getScale = (sourceDims, targetDims) => {
    // set denominator divide-by-zero epsilon
    const eps = 0.0000000001;
    // compute image scaling coefficient
    return {
        x: targetDims.w > 0 ? ((sourceDims.w + eps) / (targetDims.w + eps)) : 1.0,
        y: targetDims.h > 0 ? ((sourceDims.h + eps) / (targetDims.h + eps)) : 1.0
    }
}

/**
 * Scale coordinate by image resize dimensions.
 *
 * @public
 * @param pt
 * @param sourceDims
 * @param targetDims
 */

export const scalePoint = (pt, sourceDims, targetDims) => {

    // get image scaling coefficient
    const scale = getScale(sourceDims, targetDims);

    // compute actual pixel position in image
    return {
        x: Math.round(pt.x * scale.x),
        y: Math.round(pt.y * scale.y)
    };
}

/**
 * Crop image by coordinates.
 *
 * @publicx
 * @param cv
 * @param canvas
 * @param image
 * @param cropDims
 */

export const cropImage = (cv, canvas, image, cropDims) => {
    let src = cv.matFromImageData(image);

    // crop src -> dst image dimensions
    // compute region of interest (ROI)
    let rect = new cv.Rect(cropDims.x, cropDims.y, cropDims.w, cropDims.h);
    let dst = src.roi(rect);

    // use CV to load cropped image to canvas
    cv.imshow(canvas, dst);

    // convert to ImageData datatype and save to state
    // const dstData = new Uint8ClampedArray(dst.data);
    src.delete(); dst.delete();
    // return new ImageData(dstData, cropDims.w, cropDims.h);
}

/**
 * Scale width of larger image to match smaller.
 *
 * @public
 * @param ctrlDims
 * @param respDims
 * @return {Object} updatedDims
 */

export const scaleToMatch = (ctrlDims, respDims) => {
    const eps = 0.00000001;
    // scale dimensions of response panel to match control panel
    const updatedDims = scaleToFit(
        ctrlDims.w,
        ctrlDims.h,
        respDims.w,
        respDims.h,
    );
    // return scaled control dimensions
    return {
        response: updatedDims,
        control: {
            w: updatedDims.w,
            h: Math.round(ctrlDims.h * (updatedDims.w + eps) / (ctrlDims.w + eps))
        }
    };
}