/*!
 * MLP.Client.Components.IAT.Graphics
 * File: graphics.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Draw all selected control points on to mask canvas.
 *
 * @public
 * @param ctx
 * @param properties
 */

export const eraseOverlay = (ctx, properties) => {
    ctx.clearRect(0, 0, properties.base_dims.w, properties.base_dims.h);
};

/**
 * Draw control point to canvas.
 *
 * @public
 * @return {Object}
 * @param ctx
 * @param x
 * @param y
 * @param index
 * @param colour
 */

export const drawControlPoint = (ctx, x, y, index, colour='#fb5607') => {

    // draw cross hair
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = colour;
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 20);
    ctx.stroke();

    // write control point index
    ctx.font = '1em sans-serif';
    ctx.fillStyle = colour;
    ctx.fillText(String(index + 1), x + 7, y + 17);

    // write bounding box
    ctx.beginPath();
    ctx.fillStyle = 'rgba(227,100,20,0.1)';
    ctx.rect(x - 20, y - 20, 40, 40);
    ctx.fill();
};

/**
 * Draw all selected control points on to mask canvas.
 *
 * @public
 * @param ctx
 * @param props1
 * @param props2
 */

export const drawControlPoints = (ctx, props1, props2) => {

    // clear canvas
    ctx.clearRect(0, 0, props1.base_dims.w, props1.base_dims.h);

    // draw points separately
    props1.pts.forEach((pt, index) => {
        drawControlPoint(ctx, pt.x, pt.y, index);
    });

    // overlay other panel control points (optional)
    if (props2 && props2.pts.length > 0) {
        props2.pts.forEach((pt, index) => {
            drawControlPoint(ctx, pt.x, pt.y, index, 'blue');
        });
    }
};

/**
 * Draw all selected control points on to mask canvas.
 *
 * @public
 * @param ctx
 * @param x
 * @param y
 * @param width
 * @param height
 * @param properties
 */

export const drawBoundingBox = (x, y, width, height, ctx, properties) => {

    // erase mask layer canvas
    ctx.clearRect(0, 0, properties.base_dims.w, properties.base_dims.h);

    // draw bounding box
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(x, y, width, height);
};

