/*!
 * MLP.Client.Components.IAT.Pointer
 * File: pointer.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */
import Button from '../common/button';
import React from 'react';
import { inRange, scalePoint } from './transform.iat';
import { getError } from '../../_services/schema.services.client';
import { drawControlPoints } from './graphics.iat';
import { correlation } from '../../_utils/iat.utils.client';
import Badge from '../common/badge';

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
    const [selectBox, setSelectBox] = React.useState({ x: 0, y: 0, w: 0, h: 0 });
    const [index, setIndex] = React.useState(-1);
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
        setSelected({
            x: pos.x,
            y: pos.y,
        });
    };
    const setSelect = (selected) => {
        setSelected(selected);
    };
    const resetSelectBox = (selected) => {
        setSelectBox({ x: 0, y: 0, w: 0, h: 0 });
    };
    const deselect = () => {
        setSelected(null);
        setIndex(-1);
    };
    const reset = () => {
        setCurrent({ x: 0, y: 0 });
    };

    return {
        x: current.x,
        y: current.y,
        set,
        magnify,
        magnifyOn,
        magnifyOff,
        select,
        setSelect,
        deselect,
        reset,
        selected,
        index,
        setIndex,
        selectBox,
        setSelectBox,
        resetSelectBox
    };
}

/**
 * Show selected control points. Allows for deletion of last point.
 *
 * @param properties
 * @param otherProperties
 * @param callback
 * @public
 */

const ControlPoints = ({ properties, otherProperties, callback }) => {
    // compute pearson correlation coefficient to test collinearity
    const corr = Math.abs(correlation(properties.pts)).toFixed(2);
    return <>
        {
            (properties.pts || []).length > 0 &&
            <div className={'canvas-view-control-points h-menu'}>
                <ul>
                    {
                        // show selected control points
                        properties.pts.map((pt, index) => {
                            const scaledPt = scalePoint(pt, properties)
                            return <li key={`${properties.id}_ctrlpt_${index}`}>
                                <Button
                                    key={`${properties.id}_selected_pt_${index}`}
                                    icon={'crosshairs'}
                                    label={index + 1}
                                    title={`Control point at (${scaledPt.x}, ${scaledPt.y})`}
                                />
                            </li>;
                        })
                    }
                    <li className={'push'}>
                        <Badge
                            className={corr < 0.5 ? 'success' : 'error'}
                            icon={corr < 0.5 ? 'success' : 'error'}
                            label={corr}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={otherProperties.pts.length === 0}
                            key={`${properties.id}_view_pt`}
                            icon={'crosshairs'}
                            label={'Overlay'}
                            title={`Overlay other panel control points.`}
                            onClick={() => {
                                return callback({
                                    status: 'draw',
                                    props: { other_panel: !properties.other_panel },
                                    draw: drawControlPoints,
                                });
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            key={`${properties.id}_delete_pt`}
                            icon={'delete'}
                            title={`Delete control point ${properties.pts.length}`}
                            onClick={() => {
                                // delete last control point
                                callback({
                                    status: 'draw',
                                    props: { 'pts': properties.pts.splice(0, properties.pts.length - 1) },
                                    draw: drawControlPoints,
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
    const eps = 0.000000001
    const scaleX = (canvasDims.w + eps) / (bounds.w + eps);
    const scaleY = (canvasDims.h + eps) / (bounds.h + eps);

    const x = Math.max(
        Math.min(
            Math.floor((e.clientX - bounds.left) * scaleX), canvasDims.w,
        ), 0,
    );
    const y = Math.max(
        Math.min(
            Math.floor((e.clientY - bounds.top) * scaleY), canvasDims.h,
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

    // get current pointer position
    const { x=0, y=0 } = getPos(e, properties);

    // get existing control points
    const pts = properties.pts;

    // check if mouse cursor proximate to existing control point
    let selected = false;
    pts.forEach((pt, index) => {
        if (inRange(x, y, pt.x, pt.y, options.ptrRadius)) {
            // set pointer control point index
            selected = true;
            pointer.setIndex(index);
        }
    });

    // return control point index if proximate
    if (selected) return;

    // check if the maximum number of control points has been reached
    if (properties.pts.length >= options.controlPtMax) {
        return callback({
            error: {
                msg: getError('maxControlPoints', 'canvas'),
                type: 'error',
                status: 'draw',
                draw: drawControlPoints,
            },
        });
    }
    // otherwise, draw new control point and save as canvas property
    return callback({
        status: 'draw',
        props: { pts: properties.pts.concat({x: pointer.x, y: pointer.y}) },
        draw: drawControlPoints,
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
    pointer.setIndex(-1);
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
    if (!pointer.selected || pointer.index < 0) return;

    // get the current selected control point position
    const ctrlPt = properties.pts[pointer.index];
    if (!ctrlPt) return;

    // compute distance traveled
    const _x = ctrlPt.x + pointer.x - pointer.selected.x;
    const _y = ctrlPt.y + pointer.y - pointer.selected.y;

    // // update the pointer selected point
    pointer.setSelect({ x: _x, y: _y });

    // update panel control points
    const updatedPoints = [...properties.pts];
    updatedPoints[pointer.index] = { x: _x, y: _y };

    return callback({
        status: 'draw',
        props: { pts: updatedPoints },
        draw: drawControlPoints
    });

};