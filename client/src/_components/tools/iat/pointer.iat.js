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
 * Create pointer hook.
 *
 * @param properties
 * @return pointer
 */

export function usePointer (properties) {
    const [current, setCurrent] = React.useState({ x: 0, y: 0 });
    const [selected, setSelected] = React.useState(null);
    const [index, setIndex] = React.useState(null);
    const [magnify, setMagnify] = React.useState(false);

    const set = (e) => {
        const pos = getPos(e, properties);
        setCurrent(pos);
    };
    const magnifyOn = () => {
        setMagnify(true);
    };
    const magnifyOff = () => {
        setMagnify(false);
    };
    const select = (e) => {
        const pos = getPos(e, properties);
        setSelected(pos);
    };
    const deselect = () => {
        setSelected(null);
    };
    const reset = () => {
        setCurrent({x: 0, y: 0})
        setSelected(null);
    }

    return {
        x: current.x,
        y: current.y,
        set,
        magnify,
        magnifyOn,
        magnifyOff,
        select,
        deselect,
        reset,
        selected,
        index,
        setIndex
    }
}

export const createPointer = (panelProps, properties, setProperties) => {
    return {
        x: properties.x,
        y: properties.y,
        selected: properties.selected,
        magnify: properties.magnify,

    }
};

/**
 * Show selected control points. Allows for deletion of last point.
 *
 * @param properties
 * @param pointer
 * @param options
 * @public
 */

const ControlPoints = ({ properties, pointer, options }) => {
    return <>

        {
            ( properties.pts || [] ).length > 0 &&
            <div className={'canvas-view-controls h-menu'}>
                <ul>
                    {
                        // show selected control points
                        properties.pts.map((pt, index) => {
                            return <li>
                                <Button
                                    key={`${properties.id}_selected_pt_${index}`}
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
                            key={`${properties.id}_delete_pt`}
                            icon={'delete'}
                            title={`Delete control point ${properties.pts.length}`}
                            onClick={() => {
                                // delete last control point
                                return { data: {'pts': properties.pts.splice(-1, 1) } };
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
 * @param properties
 */

export const getPos = (e, properties) => {

    // current canvas dimensions
    const canvasDims = properties.base_dims;
    const bounds = properties.bounds;

    // compute scaling relationship bitmap vs. element for X, y
    const scaleX = (canvasDims.x + 0.0001) / (bounds.x);
    const scaleY = (canvasDims.y + 0.0001) / (bounds.y);

    const x = Math.max(
        Math.min(
            Math.floor((e.clientX - bounds.left) * scaleX), canvasDims.x,
        ), 0,
    );
    const y = Math.max(
        Math.min(
            Math.floor((e.clientY - bounds.top) * scaleY), canvasDims.y,
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
 * @param properties
 * @param options
 * @param pointer
 */

export const moveControlPoint = (e,
                                 properties,
                                 pointer,
                                 options) => {

    // proceed if mouse is down (selected point)
    if (!pointer.selected) return;

    // get the current mouse pointer position
    const point = getPos(e);
    const x = point.x;
    const y = point.y;

    // update the pointer selected point
    const _x = x - pointer.selected.x;
    const _y = y - pointer.selected.y;

    return {data: {x: _x, y: _y}}

};

/**
 * Store selected alignment control points.
 *
 * @public
 * @param e
 * @param properties
 * @param options
 * @param pointer
 * @return {Object}
 */

export const selectControlPoint = (e, properties, pointer, options) => {

    e.preventDefault();

    // get current cursor position
    const pt = getPos(e, properties);
    const x = pt.x;
    const y = pt.y;
    const radius = 20;
    let selected = null;

    // get existing control points
    const pts = properties.pts;

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
    if (properties.pts.length >= options.controlPtMax) {
        return { error: getError('maxControlPoints', 'canvas') };
    }
    // otherwise, draw new control point and save as canvas property
    else {
        const pts = properties.pts.concat(pt);
        pointer.selected({ x: x, y: y, index: pts.length - 1 });
        return { data:{ pts: pts} };
    }
};

/**
 * Deselect alignment control points.
 *
 * @public
 * @param e
 * @param properties
 * @param pointer
 * @param options
 * @return {Object}
 */

export const deselectControlPoint = (e, properties, pointer, options) => {

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