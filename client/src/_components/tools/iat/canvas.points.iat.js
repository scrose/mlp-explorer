/*!
 * MLP.Client.Components.IAT.Canvas.Points
 * File: iat.canvas.points.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */
import Button from '../../common/button';
import React from 'react';
import { inRange } from './transform.iat';
import { getError } from '../../../_services/schema.services.client';

/**
 * Show selected control points. Allows for deletion of last point.
 *
 * @param canvas
 * @param panel
 * @param pointer
 * @param trigger
 * @param options
 * @public
 */

const ControlPoints = ({ layers, panel, pointer, trigger, options }) => {
    const enabled = options.mode === 'select';
    const canvas = layers.control;
    return <>

        {
            ( panel.pts || [] ).length > 0 &&
            <div className={'canvas-view-controls h-menu'}>
                <ul>
                    {
                        // show selected control points
                        panel.pts.map((pt, index) => {
                            return <li>
                                <Button
                                    key={`${panel.id}_selected_pt_${index}`}
                                    icon={'crosshairs'}
                                    label={index + 1}
                                    title={`Control point at (${pt.x}, ${pt.y})`}
                                />
                            </li>;
                        })
                    }
                    <li>
                        <Button
                            className={'push'}
                            key={`${panel.id}_delete_pt`}
                            icon={'delete'}
                            title={`Delete control point ${panel.pts.length}`}
                            onClick={() => {
                                // delete last control point
                                panel.set('pts', panel.pts.splice(-1, 1));
                                trigger.reload();
                            }}
                        />
                    </li>
                </ul>
            </div>
        }
    </>;
};

export default ControlPoints;

/**
 * Get local mouse position on canvas.
 * Reference: https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
 *
 * @public
 * @param e
 * @param canvas
 */

export const getPos = (e, canvas) => {
    // select control layer to read mouse position
    const rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,   // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    const x = Math.max(
        Math.min(
            Math.floor((e.clientX - rect.left) * scaleX), canvas.width,
        ), 0,
    );
    const y = Math.max(
        Math.min(
            Math.floor((e.clientY - rect.top) * scaleY), canvas.height,
        ), 0,
    );

    // scale mouse coordinates after they have been adjusted to be relative to element
    return { x: x, y: y };
};

/**
 * Get local mouse position on canvas.
 * Reference: http://jsfiddle.net/m1erickson/sEBAC/
 *
 * @public
 * @param e
 * @param layers
 * @param panel
 * @param trigger
 * @param options
 * @param pointer
 */

export const moveControlPoint = (e,
                                 layers,
                                 panel,
                                 trigger,
                                 pointer,
                                 options) => {

    // proceed if mouse is down (selected point)
    if (!pointer.selected) return;

    // get the current mouse pointer position
    const point = getPos(e, layers.control);
    const x = point.x;
    const y = point.y;

    // update the pointer selected point
    const _x = x - pointer.selected.x;
    const _y = y - pointer.selected.y;


};

/**
 * Create pointer object.
 * @param canvas
 * @param props
 * @param setProps
 * @return pointer
 */

export const createPointer = (canvas, props, setProps) => {
    return {
        x: props.x,
        y: props.y,
        selected: props.select,
        magnify: props.magnify,
        get: () => {
            return props;
        },
        set: (e) => {
            const pos = getPos(e, canvas);
            setProps(data => ({ ...data, x: pos.x, y: pos.y, cX: pos.cX, cY: pos.cY }));
        },
        magnifyOn: () => {
            setProps(data => ({ ...data, magnify: true }));
        },
        magnifyOff: () => {
            setProps(data => ({ ...data, magnify: false }));
        },
        select: (e) => {
            const pos = getPos(e, canvas);
            setProps(data => ({ ...data, selected: { x: pos.x, y: pos.y } }));
        },
        deselect: () => {
            setProps(data => ({ ...data, selected: null }));
        },
        reset: () => {
            setProps(data => ({ ...data, x: 0, y: 0, selected: null }));
        }
    }
};

/**
 * Store selected alignment control points.
 *
 * @public
 * @param e
 * @param layers
 * @param panel
 * @param trigger
 * @param options
 * @param pointer
 * @return {Object}
 */

export const selectControlPoint = (e,
                                   layers,
                                   panel,
                                   trigger,
                                   pointer,
                                   options) => {

    e.preventDefault();

    // get current cursor position
    const pt = getPos(e, layers.control);
    const x = pt.x;
    const y = pt.y;
    const radius = 20;
    let selected = null;

    // get existing control points
    const pts = panel.pts;

    // check if mouse cursor proximate to existing control point
    pts.forEach((pt, index) => {
        if (inRange(x, y, pt.x, pt.y, radius)) {
            // set canvas pointer selection properties
            // - generate data URL from canvas
            selected = { x: x, y: y, index: index };
            pointer.selected(selected)
        }
    });
    if (selected) return {};

    // check if the maximum number of control points has been reached
    if (panel.pts.length >= options.controlPtMax) {
        return { error: getError('maxControlPoints', 'canvas') };
    }
    // otherwise, draw new control point and save as canvas property
    else {
        const pts = panel.pts.concat(pt);
        pointer.selected({ x: x, y: y, index: pts.length - 1 });
        panel.set('pts', pts);
        drawControlPoints(layers.markup, pts);
        return {};
    }
};

/**
 * Deselect alignment control points.
 *
 * @public
 * @param e
 * @param layers
 * @param panel
 * @param trigger
 * @param pointer
 * @param options
 * @return {Object}
 */

export const deselectControlPoint = (e,
                                     layers,
                                     panel,
                                     trigger,
                                     pointer,
                                     options) => {

    // check if destination control point proximate to existing point
    // const updatedPts = props.pts.map((pt, index) => {
    //     if ( pt.inRange(x, y) ) {
    //         const _x = pt.x + (x - selected.x);
    //         const _y = pt.y + (y - selected.y);
    //         selected = {x: x, y: y, index: index};
    //
    //         // magnify cursor region
    //         magnify(x, y, props, magnifier);
    //
    //         // update position of selected control point
    //         return {
    //             x: _x,
    //             y: _y,
    //             inRange: inRange(_x, _y, radius)
    //         }
    //     }
    //     return pt;
    // });

    // draw final control point
    drawControlPoints(layers.markup, panel.pts);
    pointer.deselect();
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
 */

const drawControlPoint = (ctx, x, y, index) => {

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
 * Draw all selected control points on markup canvas.
 *
 * @public
 * @param canvas
 * @param pts
 */

export const drawControlPoints = (canvas, pts) => {

    // erase markup layer canvas
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    // draw points separately
    pts.forEach((pt, index) => {
        drawControlPoint(ctx, pt.x, pt.y, index);
    });
};