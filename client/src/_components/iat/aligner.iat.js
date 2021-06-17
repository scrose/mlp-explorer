/*!
 * MLP.Client.IAT.Aligner
 * File: aligner.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * Adapted from IAT web application
 * MIT Licensed
 */

import * as math from 'mathjs';
import { getError } from '../../_services/schema.services.client';
import { scalePoint } from './transform.iat';

/**
 * Compute alignment transformation matrix image data.
 * - Uses four control points (x,y) given in each canvas
 * - Solves the linear problem H[x,y] = k[u,v] for h
 * - where  h = [h0, h1, h2, h3, h4, h5, h6, h7]
 *          x = [x0, x1, x2, x3], y = [y0, y1, y2, y3]
 *          u = [u0, u1, u2, u3], v = [v0, v1, v2, v3]
 *          p = [[x0, y0], [u0, v0], [x1, y1], [u1, v1],
 *              [x2, y2], [u2, v2], [x3, y3], [u4, v4]]
 * - The transformation matrix H is then defined as:
 *      H = |h0  h1  0  h2|
 *          |h3  h4  0  h5|
 *          |0   0   1   0|
 *          |h6  h7  0   1|
 *
 * Reference: https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
 *
 * @public
 * @return {*[]}
 * @param from
 * @param to
 */

export const getAlignmentTransform = (from, to) => {

    // Ax = b
    let A = [];
    for (let i = 0; i < 4; i++) {
        A.push([from[i].x, from[i].y, 1, 0, 0, 0, -from[i].x * to[i].x, -from[i].y * to[i].x]);
        A.push([0, 0, 0, from[i].x, from[i].y, 1, -from[i].x * to[i].y, -from[i].y * to[i].y]);
    }

    // destination control point vector
    let b = [];
    for (let i = 0; i < 4; i++) {
        b.push(to[i].x);
        b.push(to[i].y);
    }

    // solve linear system for H
    let H = math.transpose(math.lusolve(A, b))[0];
    const H2 = [[H[0], H[1], H[2]], [H[3], H[4], H[5]], [H[6], H[7], 1]];

    // Sanity check that H actually maps `from` to `to`
    for (let i = 0; i < 4; i++) {
        const lhs = math.multiply(H2, math.transpose([from[i].x, from[i].y, 1]));
        const k = lhs[2];
        const z = [to[i].x, to[i].y, 1];
        const rhs = math.multiply(z, k);
        console.assert(math.norm(math.subtract(lhs, rhs)) < 1e-9, 'Not equal:', lhs, rhs);
    }
    return H;
};
/**
 * Apply alignment transformation matrix (homographic projection) to image data.
 * NOTE: input data is Uint32 typed array to store four one-byte values (red,
 * green, blue, and alpha, or "RGBA" format). Each pixel is assigned a
 * consecutive index within the array, with the top left pixel at index 0
 * which proceed from left to right, then downward, throughout the array.
 *
 * @public
 * @param {Array} H
 * @param {Uint32Array} src
 * @param {Uint32Array} dst
 * @param {int} w
 * @param {int} h
 */

export const warpImage = (H, src, dst, w, h) => {

    // compute array index
    // function idx(ix, iy, w) {
    //     return (Math.ceil(Math.max(ix + w * iy, 0)));
    // }

    const dstW = w;
    const dstH = h;
    // const srcW = w;
    // const srcH = h;
    let x, y, u, v, k;
    for (y = 0; y < dstH; ++y) {
        for (x = 0; x < dstW; ++x) {
            // transform coordinates
            k = x * H[6] + y * H[7] + 1;
            u = (x * H[0] + y * H[1] + H[2]) / k;
            u >>= 0;
            v = (x * H[3] + y * H[4] + H[5]) / k;
            v >>= 0;
            dst[x + w * y] = src[u + w * v];
        }
    }
};

/**
 * Transform images data for alignment.
 *
 * @public
 * @param imgData1
 * @param imgData2
 * @param panel1
 * @param panel2
 * @param options
 */

export const alignImages = (imgData1, imgData2, panel1, panel2, options) => {

    // compute actual pixel position in image
    const pts1 = panel1.pts.map(pt => {
        return scalePoint(pt, panel1);
    });
    const pts2 = panel2.pts.map(pt => {
        return scalePoint(pt, panel2);
    });

    // check preconditions
    if (!imgData1 || !imgData2) {
        return { data: null, error: { msg: getError('emptyCanvas', 'canvas'), type: 'error' } };
    }
    if (pts2.length < options.controlPtMax || pts1.length < options.controlPtMax) {
        return { data: null, error: { msg: getError('missingControlPoints', 'canvas'), type: 'error' } };
    }
    if (imgData1.width !== imgData2.width) {
        return { data: null, error: { msg: getError('mismatchedDims', 'canvas'), type: 'error' } };
    }

    // compute alignment transformation matrix
    const transform = getAlignmentTransform(pts2, pts1);

    // prepare image data for alignment transformation
    const w = imgData2.width;
    const h = imgData2.height;

    // convert 8 Bit Clamped RGBA order to 32 Bit Array
    let src = new Uint32Array(imgData2.data.buffer);
    let dst = new Uint32Array(src.length);

    // apply transformation to image 2 (dst) loaded in right-hand panel (Panel 2)
    warpImage(transform, src, dst, w, h);

    // convert back to 8 Bit Clamped RGBA array
    let dstData = new Uint8ClampedArray(dst.buffer);

    // convert destination image data to ImageData object
    return { data: new ImageData(dstData, w, h), error: null };
};