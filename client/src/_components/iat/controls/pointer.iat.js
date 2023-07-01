/*!
 * MLP.Client.Components.IAT.Pointer
 * File: pointer.selector.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import {useState} from 'react';
import {scalePoint} from "./transform.iat";

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
    const {base_dims, bounds} = properties;

    // compute scaling relationship bitmap vs. element for X,Y
    const eps = 0.000000001
    const scaleX = (base_dims.w + eps) / (bounds.w + eps);
    const scaleY = (base_dims.h + eps) / (bounds.h + eps);

    const pageX = e.clientX +
        (document && document.scrollLeft || 0) -
        (document && document.clientLeft || 0);
    const pageY = e.clientY +
        (document && document.scrollTop || 0) -
        (document && document.clientTop || 0 );

    // DEBUG
    // console.log(pageX, pageY, bounds)

    // compute mouse position relative to canvas bounds
    const x = Math.max(
        Math.min(
            Math.ceil((pageX - bounds.left) * scaleX), base_dims.w,
        ), 0,
    );
    const y = Math.max(
        Math.min(
            Math.ceil((pageY - bounds.top) * scaleY), base_dims.h,
        ), 0,
    );

    // scale mouse coordinates after they have been adjusted to be relative to element
    return {x, y};
};

/**
 * Create pointer hook.
 *
 * @param properties
 * @param options
 * @return {Object} pointer
 */

export function usePointer(properties, options) {

    const [client, setClient] = useState({x: 0, y: 0});
    const [current, setCurrent] = useState({x: 0, y: 0});
    const [actual, setActual] = useState({x: 0, y: 0});
    const [selected, setSelected] = useState(null);
    const [selectBox, setSelectBox] = useState({x: 0, y: 0, w: 0, h: 0});
    const [index, setIndex] = useState(-1);
    const [magnify, setMagnify] = useState(false);
    const [points, setPoints] = useState([]);

    const set = (e) => {
        // compute current position of mouse
        const pos = getPos(e, properties);
        // set absolute client mouse coordinate
        setClient({x: e.clientX, y: e.clientY});
        // set actual
        setActual(scalePoint(pos, properties.image_dims, properties.render_dims));
        // set canvas pointer coordinate
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
    const resetSelectBox = () => {
        setSelectBox({x: 0, y: 0, w: 0, h: 0});
    };
    const deselect = () => {
        setSelected(null);
        setIndex(-1);
    };
    const reset = () => {
        setCurrent({x: 0, y: 0});
    };

    // set control points state
    const setControlPoints = (controlPoints) => {
        setPoints(controlPoints);
    };

    // clear control points state
    const clearPoints = () => {
        setPoints([]);
    };

    return {
        x: current.x,
        y: current.y,
        client,
        actual,
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
        resetSelectBox,
        points,
        setPoints: setControlPoints,
        clearPoints
    };
}