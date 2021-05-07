/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../../common/button';
import { schema } from '../../../schema';
import PanelControls from './panel.controls.iat';
import { initPanel } from './iat';
import CanvasInfo from './panel.info.iat';
import ControlPoints, { createPointer } from './point.iat';
import Magnifier from './magnify.iat';
import { loadCanvas, loadImageData, loadRenderLayer, toImageData } from './load.iat';
import { useRenderCanvas } from './canvas.iat';

/**
 * No operation.
 */

const noop = () => {
};


/**
 * IAT panel component.
 *
 * NOTES:
 * FILE: Adapted from Image Analysis Toolkit (IAT), Mike Whitney
 *
 * @param id
 * @param label
 * @param hidden
 * @param options
 * @param properties
 * @param setProperties
 * @param trigger
 * @param pointerProps
 * @param setMessage
 * @param setDialogToggle
 * @param onClick
 * @param onMouseUp
 * @param onMouseDown
 * @param onMouseOver
 * @param onMouseOut
 * @param onMouseMove
 * @param onKeyDown
 * @param onKeyUp
 * @public
 */

export const PanelIat = ({
                             id = 'canvas0',
                             label = '',
                             hidden = false,
                             options = {},
                             inputImage = null,
                             setInputImage = noop,
                             properties = {},
                             setProperties = noop,
                             pointerProps = {},
                             setPointer = noop,
                             onClick = noop,
                             onMouseUp = noop,
                             onMouseDown = noop,
                             onMouseOver = noop,
                             onMouseOut = noop,
                             onMouseMove = noop,
                             onKeyDown = noop,
                             onKeyUp = noop,
                             setMessage = noop,
                             setDialogToggle = noop,
                         }) => {

    // create DOM references
    // - canvas consists of three layers (from top):
    // -- control layer to handle user events
    // -- markup layer to annotate image data
    // -- edit layer to display transformed image data
    // -- base layer
    const controlLayerRef = React.useRef(null);
    const markupLayerRef = React.useRef(null);
    const dataLayerRef = React.useRef(null);
    // const renderLayerRef = React.useRef(null);
    const baseLayerRef = React.useRef(null);

    // source image data state (used for images referenced by URLs)
    const imgRef = React.useRef(null);

    // create layers objects
    const layers = {
        control: () => { return controlLayerRef.current},
        markup: () => { return markupLayerRef.current},
        data: () => { return dataLayerRef.current},
        base: () => { return baseLayerRef.current},
        image: () => { return imgRef.current},
        loaded: () => {return !!baseLayerRef.current}
    };

    const [renderLayerRef, imgData] = useRenderCanvas(inputImage);

    // loading status state
    const statusLabel = ['Empty', 'Loading', 'Redraw', 'Loaded', 'Error'];
    const _EMPTY = 0, _LOADING = 1, _REDRAW = 2, _LOADED = 3, _ERROR = 4;
    const [status, setStatus] = React.useState(_EMPTY);

    // internal image data source
    // - used to reset canvas data
    const [source, setSource] = React.useState(null);
    const [imgSrc, setImgSrc] = React.useState(null);

    /**
     * Create pointer.
     */

    const pointer = createPointer(controlLayerRef.current, pointerProps, setPointer);

    /**
     * Create wrapper for panel properties operations
     */

    const panel = createPanel(properties, setProperties);

    /**
     * Handle file processing and input control responses.
     */

    const _callback = (response) => {
        const {error='', data=null, props={}, src=null} = response || {};
        if (error || response.hasOwnProperty('message')) {
            console.warn(error);
            setMessage(error)
            setStatus(_ERROR);
            return
        }
        if (props) panel.update(props);
        if (data) setInputImage(data);
        if (src) setImgSrc(src);
    };

    /**
     * Handle canvas event.
     * - reset pointer to (0, 0)
     */

    const _handleEvent = (e, _handler) => {
        //setStatus(_LOADING);
        const { data = {}, error = '' } = _handler(
            e,
            properties,
            pointer,
            options,
        ) || {};
        _callback(error);
        return data;
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer to (0, 0)
     */

    const _handleMouseUp = (e) => {
        pointer.reset();
        return _handleEvent(e, onMouseUp);
    };

    /**
     * Handle canvas mouse down event.
     * - reset pointer to (0, 0)
     */

    const _handleMouseDown = (e) => {
        pointer.select(e);
        return _handleEvent(e, onMouseDown);
    };

    /**
     * Handle canvas mouse over event.
     */

    const _handleMouseOver = e => {
        pointer.set(e);
        return _handleEvent(e, onMouseOver);
    };

    /**
     * Handle canvas mouse move event.
     */

    const _handleMouseMove = e => {
        pointer.set(e);
        return _handleEvent(e, onMouseMove);
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer to (0, 0)
     */

    const _handleMouseOut = (e) => {
        console.log('mouseout');
        pointer.reset();
        return _handleEvent(e, onMouseOut);
    };

    /**
     * Handle canvas mouse move event.
     */

    const _handleOnClick = e => {
        return _handleEvent(e, onClick);
    };

    /**
     * Handle key down.
     */

    const _handleOnKeyDown = (e) => {
        return _handleEvent(e, onKeyDown);
    };

    /**
     * Handle key up.
     */

    const _handleOnKeyUp = (e) => {
        return _handleEvent(e, onKeyUp);
    };

    /**
     * Handle canvas image loading.
     */

    const _handleImageLoad = () => {
        setDialogToggle({
            type: 'selectImage',
            id: id,
            label: label,
            callback: (data) => {
                setStatus(_LOADING);
                loadImageData(_callback, data).catch(_callback)
            } });
    };

    React.useEffect(() => {

        // reject uninitialized elements
        if (!properties.redraw) return;
        if (!dataLayerRef.current || !renderLayerRef.current) return;

        const dataCanvas = dataLayerRef.current;
        const renderCanvas = renderLayerRef.current;


        // console.log(properties, inputImage)

        console.log('Redraw!')

        // get data layer dims (upper limit is the base canvas)
        const dWidth = Math.min(properties.data_dims.x, properties.base_dims.x);
        const dHeight = Math.min(properties.data_dims.y, properties.base_dims.y);

        // clear data layer canvas
        const ctx = dataCanvas.getContext('2d');
        ctx.clearRect(0, 0, dataCanvas.width, dataCanvas.height);

        // draw image to data layer canvas
        //ctxData.imageSmoothingQuality = 'high';
        ctx.drawImage(renderCanvas, properties.offset.x, properties.offset.y, dWidth, dHeight);

        panel.set('redraw', false);
        setStatus(_LOADED)

    }, [status, inputImage, dataLayerRef, renderLayerRef, properties, setStatus]);

    /**
     * Render Panel
     */
    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <PanelControls
                    disabled={status !== _LOADED}
                    properties={properties}
                    pointer={pointer}
                    options={options}
                    callback={_callback}
                    setDialogToggle={setDialogToggle}
                />
                <div className={'canvas-layers'}>
                    <Magnifier
                        pointer={pointer}
                        panel={panel}
                        options={options}
                    />
                    {
                        status !== _LOADED &&
                        <div
                            className={'layer canvas-placeholder'}
                            style={{
                                width: properties.base_dims.x,
                                height: properties.base_dims.y,
                                paddingTop: properties.base_dims.y / 2 - 10,
                            }}
                        >
                            {
                                status === _LOADING
                                    ? <Button label={'Loading'} spin={true} icon={'spinner'} />
                                    : <Button
                                        icon={'download'}
                                        label={'Click to load image'}
                                        onClick={_handleImageLoad}
                                    />
                            }
                        </div>
                    }
                    <canvas
                        ref={controlLayerRef}
                        id={`${id}_control_layer`}
                        tabIndex={0}
                        className={`layer canvas-layer-control-${options.mode}`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                        onMouseUp={_handleMouseUp}
                        onMouseDown={_handleMouseDown}
                        onMouseMove={_handleMouseMove}
                        onMouseOut={_handleMouseOut}
                        onMouseOver={_handleMouseOver}
                        onClick={_handleOnClick}
                        onKeyDown={_handleOnKeyDown}
                        onKeyUp={_handleOnKeyUp}
                    >
                        Control Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={markupLayerRef}
                        id={`${id}_markup_layer`}
                        className={`layer canvas-layer-markup`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                    >
                        Markup Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={dataLayerRef}
                        id={`${id}_data_layer`}
                        className={`layer canvas-layer-data${status !== _LOADED ? 'hidden' : ''}`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={renderLayerRef}
                        id={`${id}_render_layer`}
                        className={`layer canvas-layer-data hidden`}
                        width={properties.render_dims.x}
                        height={properties.render_dims.y}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={baseLayerRef}
                        id={`${id}_base_layer`}
                        className={`canvas-layer-base`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                    >
                        Base Layer: Canvas API Not Supported
                    </canvas>
                </div>
                <ControlPoints
                    properties={properties}
                    pointer={pointer}
                    options={options}
                />
                <CanvasInfo
                    panel={panel}
                    pointer={pointer}
                    status={statusLabel[status]} />
                <img
                    ref={imgRef}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={`Canvas ${id} loaded data.`} />
            </div>
        </>;
};


/**
 * Create wrapper for panel properties operations

 * @return pointer
 * @param properties
 * @param setProperties
 */

export const createPanel = (properties, setProperties) => {
    return {
            id: properties.id,
            pts: properties.pts,
            props: properties,
            get: (key) => {
                return properties[key];
            },
            set: (key, value) => {
                setProperties(data => ({ ...data, [key]: value }));
            },
            update: (inputData) => {
                setProperties(data => (
                    Object.keys(inputData).reduce((o, key) => {
                        o[key] = inputData[key];
                        return o;
                    }, data)),
                );
            },
            reset: () => {
                setProperties(initPanel(properties.id, properties.label));
            },
        };
};
