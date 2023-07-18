/*!
 * MLE.Client.Tools.Toolkit.Comparator
 * File: comparator.toolkit.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Dialog to compare panel images loaded in MLE Toolkit.
 *
 * ---------
 * Revisions
 * - 14-07-2023   Added reset button to restore original positions of images.
 */

import React, {useEffect, useRef, useState} from 'react';
import InputSelector from '../../selectors/input.selector';
import {useIat} from "../../../_providers/toolkit.provider.client";
import Canvas from "../canvas/default.canvas.toolkit";
import {scaleToFit} from "./scaler.toolkit";
import {getPos, usePointer} from "./pointer.toolkit";
import Button from "../../common/button";
import baseGrid from "../../svg/grid.svg";
import Grid from "../canvas/grid.canvas.toolkit";

/**
 * Comparator component for comparing and overlaying MLE Toolkit panel images
 *
 * @public
 * @return {JSX.Element}
 */

export const ComparatorTool = () => {

    const iat = useIat();

    // define comparator canvas dimensions
    const comparatorDims = {
        w: 1200,
        h: 1200
    }

    // define canvas layers
    const controlLayer = useRef(null);
    const renderLayer1 = useRef(null);
    const renderLayer2 = useRef(null);
    const imageLayer1 = useRef(null);
    const imageLayer2 = useRef(null);
    const gridLayer = useRef(null);

    // panel properties
    const [properties, setProperties] = useState({
        base_dims: comparatorDims,
        bounds: { top: 0, left: 0, w: 0, h: 0 },
        image_dims: [{w: 0, h: 0}, {w: 0, h: 0}],
        render_dims: [{x: 0, y: 0, w: 0, h: 0}, {x: 0, y: 0, w: 0, h: 0}]
    });

    // top layer opacity state
    const [opacity, setOpacity] = useState(100);

    // layer swap toggle
    const [topLayer, setTopLayer] = useState(0);

    // create new pointer
    const pointer = usePointer(properties, iat.options);

    /**
     * Handle canvas reset to initial position and opacity
     * - reset pointer to (0, 0)
     */

    const _handleReset = (e) => {
        e.preventDefault();
        pointer.reset();
        pointer.setSelect(null);
        const viewDims1 = scaleToFit(
            properties.image_dims[0].w,
            properties.image_dims[0].h,
            iat.options.maxCanvasWidth,
            iat.options.maxCanvasHeight,
        );
        const viewDims2 = scaleToFit(
            properties.image_dims[1].w,
            properties.image_dims[1].h,
            iat.options.maxCanvasWidth,
            iat.options.maxCanvasHeight,
        );
        // redraw layer views
        renderLayer1.current.draw(imageLayer1.current.canvas(), {
            view: { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h },
            source: { x: 0, y: 0, w: properties.image_dims[0].w, h: properties.image_dims[0].h }
        });
        renderLayer2.current.draw(imageLayer2.current.canvas(), {
            view: { x: 0, y: 0, w: viewDims2.w, h: viewDims2.h },
            source: { x: 0, y: 0, w: properties.image_dims[1].w, h: properties.image_dims[1].h }
        });
        // reset opacity
        setOpacity(100);
        renderLayer1.current.alpha(1.0);
        renderLayer2.current.alpha(1.0);
        // reset top layer
        setTopLayer(0);
    };

    /**
     * change top layer opacity
     *
     * @private
     */

    const _handleOpacityChange = (e) => {
        const { target = {} } = e || {};
        const { value = 100 } = target;
        setOpacity(value);
        // set canvas layer alpha value for opacity
        topLayer === 0 ? renderLayer1.current.alpha( value / 100 ) : renderLayer2.current.alpha( value / 100 );
    }

    /**
     * swap top and bottom layers
     *
     * @private
     */

    const _handleLayerSwap = () => {
        // toggle swap
        topLayer === 0 ? setTopLayer(1) : setTopLayer(0);

        // reset opacity
        setOpacity(100);
        renderLayer1.current.alpha(1.0);
        renderLayer2.current.alpha(1.0);
    }

    /**
     * Handle canvas mouse up event.
     * - deselect pointer selected point
     */

    const _handleMouseUp = (e) => {
        e.preventDefault();
        pointer.deselect();
    };

    /**
     * Handle canvas mouse down event.
     * - add selected click coordinate to pointer
     */

    const _handleMouseDown = (e) => {
        e.preventDefault();
        pointer.set(e);
        const pos = getPos(e, properties);
        // determine if pointer coordinate is inside image
        const inRange =
            pos.x >= properties.render_dims[topLayer].x
            && pos.x <= properties.render_dims[topLayer].x + properties.render_dims[topLayer].w
            && pos.y >= properties.render_dims[topLayer].y
            && pos.y <= properties.render_dims[topLayer].y + properties.render_dims[topLayer].h

        // if in-range, select image for panning
        if (inRange) pointer.select(e);
    };

    /**
     * Handle canvas mouse move event.
     * - set pointer to position (x, y) of cursor
     */

    const _handlePan = e => {

        pointer.set(e)

        // check that mouse start position was selected
        if (!pointer.selected) return;

        e.preventDefault();

        // get current mouse position
        const pos = getPos(e, properties);

        // update the pointer selected point
        pointer.setSelect({ x: pos.x, y: pos.y });

        // select top render layer and image layer
        const renderLayer = topLayer === 0 ? renderLayer1.current : renderLayer2.current;
        const imageLayer = topLayer === 0 ? imageLayer1.current : imageLayer2.current;

        // compute distance traveled
        const _x = properties.render_dims[topLayer].x + pos.x - pointer.selected.x;
        const _y = properties.render_dims[topLayer].y + pos.y - pointer.selected.y;

        // update image offset coordinate
        renderLayer.draw(imageLayer.canvas(), {
            view: {x: _x, y: _y, w: properties.render_dims[topLayer].w, h: properties.render_dims[topLayer].h},
            source: {x: 0, y: 0, w: properties.image_dims[topLayer].w, h: properties.image_dims[topLayer].h}
        });
        // update rendered dims
        const renderDims = topLayer === 0 ?
            [{w: properties.render_dims[0].w, h: properties.render_dims[0].h, x: _x, y: _y}, properties.render_dims[1]] :
            [properties.render_dims[0], {w: properties.render_dims[1].w, h: properties.render_dims[1].h, x: _x, y: _y}]

        // update panel state
        setProperties(prevState => ({...prevState, render_dims: renderDims}));
        pointer.set(e);
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer to (0, 0)
     */

    const _handleMouseOut = (e) => {
        e.preventDefault();
        pointer.reset();
        pointer.setSelect(null);
    };

    /**
     * Filter input key presses for image methods.
     * - selects methods for given key press.
     *
     * @private`
     * @return {JSX.Element}
     */

    const _handleOnKeyDown = (e) => {
        e.preventDefault();
        const {keyCode = ''} = e || {};
        const _methods = {
            // enable magnifier
            32: () => {}
        };
        return _methods.hasOwnProperty(keyCode) ? _methods[keyCode]() : null;
    };

    /**
     * Load comparator images
     *
     * @private
     */

    useEffect(()=>{
        // load data into image layers
        imageLayer1.current.load(iat.panel1.image);
        imageLayer2.current.load(iat.panel2.image);
        // compute scaled dimensions to fit view canvas
        const viewDims1 = scaleToFit(
            iat.panel1.properties.image_dims.w,
            iat.panel1.properties.image_dims.h,
            iat.options.maxCanvasWidth,
            iat.options.maxCanvasHeight,
        );

        // draw top layer view
        renderLayer1.current.draw(imageLayer1.current.canvas(), {
            view: { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h },
            source: { x: 0, y: 0, w: iat.panel1.properties.image_dims.w, h: iat.panel1.properties.image_dims.h }
        });

        // load into image layer

        // compute scaled dimensions to fit view canvas
        const viewDims2 = scaleToFit(
            iat.panel2.properties.image_dims.w,
            iat.panel2.properties.image_dims.h,
            iat.options.maxCanvasWidth,
            iat.options.maxCanvasHeight,
        );

        // draw bottom layer view
        renderLayer2.current.draw(imageLayer2.current.canvas(), {
            view: { x: 0, y: 0, w: viewDims2.w, h: viewDims2.h },
            source: { x: 0, y: 0, w: iat.panel2.properties.image_dims.w, h: iat.panel2.properties.image_dims.h }
        });

        // set comparator properties
        const bounds = renderLayer1.current.bounds();
        setProperties({
            base_dims: comparatorDims,
            bounds: {
                top: bounds.top,
                left: bounds.left,
                w: bounds.width,
                h: bounds.height,
            },
            image_dims: [iat.panel1.properties.image_dims, iat.panel2.properties.image_dims],
            render_dims: [
                { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h },
                { x: 0, y: 0, w: viewDims2.w, h: viewDims2.h }
            ]
        });


    }, []);

    return <>
        <div className={'h-menu'}>
            <ul>
                <li>
                    <Button
                        id={'layer_swap'}
                        icon={'images'}
                        label={`Swap Layers`}
                        title={'Swap top and bottom layers.'}
                        onClick={_handleLayerSwap}
                    />
                </li>
                <li>
                    <Button
                        id={'layer_reset'}
                        icon={'undo'}
                        label={`Reset`}
                        title={'Reset images to original position and opacity.'}
                        onClick={_handleReset}
                    />
                </li>
                <li>
                    <InputSelector
                        id={'layer_opacity'}
                        name={'layer_opacity'}
                        label={`Opacity ${opacity}%`}
                        type={'range'}
                        value={opacity}
                        min={0}
                        max={100}
                        onChange={_handleOpacityChange}
                    />
                </li>
                <li className={'push'}>
                    Cursor: (x: {pointer.actual.x}, y: {pointer.actual.y})
                </li>
            </ul>
        </div>
        <Canvas
            ref={controlLayer}
            id={`comparator_image_control`}
            className={`layer canvas-layer-control-pan`}
            width={comparatorDims.w}
            height={comparatorDims.h}
            onMouseUp={_handleMouseUp}
            onMouseDown={_handleMouseDown}
            onMouseMove={_handlePan}
            onMouseOut={_handleMouseOut}
            onKeyDown={_handleOnKeyDown}
            onKeyUp={_handleMouseUp}
        />
        <Canvas
            ref={renderLayer1}
            id={`comparator_image_layer_1`}
            className={`layer canvas-layer-1`}
            style={{zIndex: topLayer === 0 ? 35 : 30}}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
        <Canvas
            ref={renderLayer2}
            id={`comparator_image_layer-2`}
            className={`layer`}
            style={{zIndex: topLayer === 1 ? 35 : 30}}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
        <Canvas
            ref={imageLayer1}
            id={`comparator_render_layer`}
            className={`layer canvas-layer-render hidden`}
            width={iat.options.maxImageWidth}
            height={iat.options.maxImageHeight}
        />
        <Canvas
            ref={imageLayer2}
            id={`comparator_render_layer`}
            className={`layer canvas-layer-render hidden`}
            width={iat.options.maxImageWidth}
            height={iat.options.maxImageHeight}
        />
        <Grid
            ref={gridLayer}
            id={`comparator_base_layer`}
            style={{ backgroundImage: `url(${baseGrid})` }}
            className={`canvas-layer-base`}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
    </>;
};