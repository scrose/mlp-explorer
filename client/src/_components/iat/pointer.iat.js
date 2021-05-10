/*!
 * MLP.Client.Components.IAT.Canvas.Points
 * File: iat.canvas.points.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */
import Button from '../common/button';
import React from 'react';
import { inRange } from './transform.iat';
import { getError } from '../../_services/schema.services.client';
import { drawControlPoints } from './graphics.iat';

/**
 * Create pointer hook.
 *
 * @param properties
 * @param options
 * @return pointer
 */

export function usePointer(properties, options) {
    const [current, setCurrent] = React.useState({ x: 0, y: 0 });
    const [selected, setSelected] = React.useState(null);
    const [index, setIndex] = React.useState(null);
    const [magnify, setMagnify] = React.useState(false);

    const get = () => {
        return {
            x: current.x,
            y: current.y,
            selected: selected,
            control: index,
        };
    };
    const set = (e) => {
        const pos = getPos(e, properties);
        setCurrent(pos);
    };
    const setControl = (controlPointIndex) => {
        setIndex(controlPointIndex);
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
        setCurrent({ x: 0, y: 0 });
        setSelected(null);
    };

    return {
        x: current.x,
        y: current.y,
        get,
        set,
        setControl,
        magnify,
        magnifyOn,
        magnifyOff,
        select,
        deselect,
        reset,
        selected,
        index,
        setIndex,
    };
}

/**
 * Show selected control points. Allows for deletion of last point.
 *
 * @param properties
 * @param callback
 * @public
 */

const ControlPoints = ({ properties, callback }) => {
    return <>

        {
            (properties.pts || []).length > 0 &&
            <div className={'canvas-view-control-points h-menu'}>
                <ul>
                    {
                        // show selected control points
                        properties.pts.map((pt, index) => {
                            return <li key={`${properties.id}_ctrlpt_${index}`}>
                                <Button
                                    key={`${properties.id}_selected_pt_${index}`}
                                    icon={'crosshairs'}
                                    label={index + 1}
                                    title={`Control point at (${pt.x}, ${pt.y})`}
                                />
                            </li>;
                        })
                    }
                    <li className={'push'}>
                        <Button
                            key={`${properties.id}_delete_pt`}
                            icon={'delete'}
                            title={`Delete control point ${properties.pts.length}`}
                            onClick={() => {
                                // delete last control point
                                callback({
                                    status: 'redraw',
                                    props: { 'pts': properties.pts.splice(0, properties.pts.length - 1) },
                                    redraw: drawControlPoints,
                                });
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
 * Store selected alignment control points.
 *
 * @public
 * @param e
 * @param properties
 * @param pointer
 * @param options
 * @param callback
 * @return
 */

export const selectControlPoint = (e, properties, pointer, options, callback) => {

    e.preventDefault();

    // get current cursor position
    const pt = getPos(e, properties);
    const x = pt.x;
    const y = pt.y;
    const radius = 20;

    // selected control point index
    let selectedCtrlPtIndex = null;

    // get existing control points
    const pts = properties.pts;

    // check if mouse cursor proximate to existing control point
    pts.forEach((pt, index) => {
        if (inRange(x, y, pt.x, pt.y, radius)) {
            // set pointer control point index
            selectedCtrlPtIndex = { control: index}
        }
    });

    // return control point index if proximate
    if (selectedCtrlPtIndex) return callback({
        point: selectedCtrlPtIndex ,
    });

    // check if the maximum number of control points has been reached
    if (properties.pts.length >= options.controlPtMax) {
        return callback({
            error: {
                msg: getError('maxControlPoints', 'canvas'),
                type: 'error',
            },
        });
    }
    // otherwise, draw new control point and save as canvas property
    return callback({
        status: 'redraw',
        props: { pts: properties.pts.concat(pt) },
        redraw: drawControlPoints,
    });
};

/**
 * Deselect alignment control points.
 *
 * @public
 * @param e
 * @param properties
 * @param pointer
 * @param options
 * @param callback
 * @return {Object}
 */

export const deselectControlPoint = (e, properties, pointer, options, callback) => {

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

    //pointer.deselect();
};


/**
 * Get local mouse position on canvas.
 * Reference: http://jsfiddle.net/m1erickson/sEBAC/
 *
 * @public
 * @param e
 * @param properties
 * @param pointer
 * @param options
 * @param callback
 */

export const moveControlPoint = (e, properties, pointer, options, callback) => {

    // proceed if mouse is down (selected point)
    if (!pointer.selected) return;

    // get the current mouse pointer position
    const point = getPos(e, properties);
    const x = point.x;
    const y = point.y;

    // get the current selected control point position
    const ctrlPt = properties.pts[pointer.control];

    // compute direction traveled in new coordinate updated by 1 px
    const _x = ctrlPt.x + Math.sign(x - pointer.selected.x);
    const _y = ctrlPt.y + Math.sign(y - pointer.selected.y);

    // update the pointer selected point
    const updatedPoints = [...properties.pts];
    updatedPoints[pointer.control] = { x: _x, y: _y };
    console.log(pointer, updatedPoints)
    return callback({
        status: 'redraw',
        props: { pts: updatedPoints },
        redraw: drawControlPoints
    });

};