/*!
 * MLP.Client.Components.IAT.Graphics
 * File: graphics.iat.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Draw control point to canvas.
 *
 * @public
 * @return {Object}
 * @param ctx
 * @param x
 * @param y
 * @param index
 */

export const drawControlPoint = (ctx, x, y, index) => {

    // draw cross hair
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fb5607';
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 20);
    ctx.stroke();

    // write control point index
    ctx.font = '1em sans-serif';
    ctx.fillStyle = '#fb5607';
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
 * @param canvas
 * @param props
 */

export const drawControlPoints = (canvas, props) => {

    // erase mask layer canvas
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    // draw points separately
    props.pts.forEach((pt, index) => {
        drawControlPoint(ctx, pt.x, pt.y, index);
    });
};