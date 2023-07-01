/*!
 * MLP.Client.Tools.IAT.Comparator
 * File: comparator.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {useEffect, useRef, useState} from 'react';
import InputSelector from '../../selectors/input.selector';
import {useIat} from "../../../_providers/iat.provider.client";
import Canvas from "../canvas/canvas.iat";
import {scaleToFit} from "./transform.iat";
import {usePointer} from "./pointer.iat";
import Button from "../../common/button";

/**
 * Compare panel images
 *
 * @public
 * @return {JSX.Element}
 */

export const Comparator = () => {

    const iat = useIat();

    // define comparator canvas dimensions
    const comparatorDims = {
        w: 800,
        h: 700
    }

    // define canvas layers
    const controlLayer = useRef(null);
    const renderLayer1 = useRef(null);
    const renderLayer2 = useRef(null);
    const imageLayer1 = useRef(null);
    const imageLayer2 = useRef(null);

    // panel properties
    const [properties, setProperties] = useState({
        base_dims: comparatorDims,
        bounds: { top: 0, left: 0, w: 0, h: 0 },
        image_dims: {w: 0, h: 0},
        render_dims: {w: 0, h: 0}
    });

    // top layer opacity state
    const [opacity, setOpacity] = useState(100);

    // layer swap toggle
    const [topLayer, setTopLayer] = useState(1);

    // create new pointer
    const pointer = usePointer(properties, iat.options);

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
        topLayer === 1 ? renderLayer1.current.alpha( value / 100 ) : renderLayer2.current.alpha( value / 100 );
    }

    /**
     * swap top and bottom layers
     *
     * @private
     */

    const _handleLayerSwap = () => {
        // toggle swap
        topLayer === 1 ? setTopLayer(2) : setTopLayer(1);

        // reset opacity
        setOpacity(100);
        renderLayer1.current.alpha(1.0);
        renderLayer2.current.alpha(1.0)
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
        pointer.select(e);
    };

    /**
     * Handle canvas mouse move event.
     * - set pointer to position (x, y) of cursor
     */

    const _handleMouseMove = e => {
        pointer.set(e);
        // check that mouse start position was selected
        if (!pointer.selected) return;

        e.preventDefault();

        // compute distance traveled
        const _x = properties.render_dims.x + pointer.x - pointer.selected.x;
        const _y = properties.render_dims.y + pointer.y - pointer.selected.y;

        // update the pointer selected point
        pointer.setSelect({ x: pointer.x, y: pointer.y });

        // select top render layer and image layer
        const renderLayer = topLayer === 1 ? renderLayer1.current : renderLayer2.current;
        const imageLayer = topLayer === 1 ? imageLayer1.current : imageLayer2.current;

        // update image offset coordinate
        renderLayer.draw(imageLayer.canvas(), {
            view: {x: _x, y: _y, w: properties.render_dims.w, h: properties.render_dims.h},
            source: {x: 0, y: 0, w: properties.image_dims.w, h: properties.image_dims.h}
        });
        // update panel state
        setProperties(prevState => ({...prevState, render_dims: {
                w: properties.render_dims.w,
                h: properties.render_dims.h,
                x: _x,
                y: _y,
            }
        }));
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
            32: () => {
                iat.panel1.pointer.magnifyOn();
                iat.panel2.pointer.magnifyOn();
            }
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
            image_dims: iat.panel1.properties.image_dims,
            render_dims: { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h }
        });


    }, []);

    return <>
        <div className={'h-menu'}>
            <ul>
                <li>
                    <Button
                        id={'layer_swap'}
                        type={'sync'}
                        label={`Swap Layers`}
                        title={'Swap top and bottom layers.'}
                        onClick={_handleLayerSwap}
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
            onMouseMove={_handleMouseMove}
            onMouseOut={_handleMouseOut}
            onKeyDown={_handleOnKeyDown}
            onKeyUp={_handleMouseUp}
        />
        <Canvas
            ref={renderLayer1}
            id={`comparator_image_layer_1`}
            className={`layer canvas-layer-1`}
            style={{zIndex: topLayer === 1 ? 35 : 30}}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
        <Canvas
            ref={renderLayer2}
            id={`comparator_image_layer-2`}
            className={`layer`}
            style={{zIndex: topLayer === 2 ? 35 : 30}}
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
    </>;
};

export default Comparator;