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
import PanelInfo from './panel.info.iat';
import ControlPoints, { usePointer } from './pointer.iat';
import Magnifier from './magnify.iat';
import { loadImageData } from './loader.iat';
import { downloader } from './downloader.iat';

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
                             properties = {},
                             setProperties = noop,
                             inputImage = null,
                             setInputImage = noop,
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

    const _isMounted = React.useRef(false);

    // create DOM references
    // - canvas consists of three layers (from top):
    // -- control layer to handle user events
    // -- markup layer to annotate image data
    // -- edit layer to display transformed image data
    // -- base layer
    const controlCanvasRef = React.useRef(null);
    const markupCanvasRef = React.useRef(null);
    const dataCanvasRef = React.useRef(null);
    const renderCanvasRef = React.useRef(null);
    const baseCanvasRef = React.useRef(null);

    // source image data state (used for images referenced by URLs)
    const imgRef = React.useRef(null);

    // loading status state
    const statusLabel = ['Empty', 'Load', 'Redraw', 'Reset', 'Loading', 'Loaded', 'Save', 'Error'];
    const _EMPTY = 0, _LOAD = 1, _REDRAW = 2, _RESET = 3, _LOADING = 4, _LOADED = 5, _SAVE = 6, _ERROR = 7;
    const [_status, _setStatus] = React.useState(_EMPTY);

    // internal image data source
    // - used to reset canvas data
    const [_source, _setSource] = React.useState(null);

    /**
     * Create pointer.
     */

    const pointer = usePointer(properties);

    /**
     * Handle file processing and input control responses.
     */

    const _callback = (response) => {
        const {
            error = null,
            data = null,
            props = null,
            status = 0
        } = response || {};
        if (error || response.hasOwnProperty('message')) {
            console.warn(error);
            setMessage(error);
            _setStatus(_ERROR);
            return;
        }
        // update local states
        if (status === _LOAD) {setInputImage(data)}
        if (status === _LOAD) {_setSource(data)}
        if (status === _RESET) {setInputImage(_source)}
        if (status === _SAVE) { downloader(id, renderCanvasRef.current, props).catch(console.error) }
        if (status === _REDRAW || status === _LOAD || status === _RESET) {
            setProperties(data => (
                Object.keys(props).reduce((o, key) => {
                    o[key] = props[key];
                    return o;
                }, data)),
            );
            _setStatus(_REDRAW)
        }

    };

    /**
     * Handle canvas event.
     * - reset pointer to (0, 0)
     */

    const _handleEvent = (e, _handler) => {
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
                loadImageData(data, _callback).catch(_callback);
            },
        });
    };

    React.useEffect(() => {
        _isMounted.current = true;

        // convenience method for updating panel properties
        const _updateProps = (props) => {
            setProperties(data => (
                Object.keys(props).reduce((o, key) => {
                    o[key] = props[key];
                    return o;
                }, data)),
            );
        };

        // reject if uninitialized DOM
        if (!dataCanvasRef.current || !renderCanvasRef.current) return;

        // redraw conditions
        if (_isMounted.current && _status === _REDRAW) {

            // set status to loading
            _setStatus(_LOADING);

            /**
             * Redraws image data to canvas
             * Note: Scale sets new data canvas dimensions
             * - dx
             *   The x-axis coordinate in the destination canvas at which to place the top-left
             *   corner of the source image.
             * - dy
             *   The y-axis coordinate in the destination canvas at which to place the top-left
             *   corner of the source image.
             * - dWidth
             *   The width to draw the image in the destination canvas. This allows scaling of the
             *   drawn image. If not specified, the image is not scaled in width when drawn.
             * - dHeight
             *   The height to draw the image in the destination canvas. This allows scaling of
             *   the drawn image. If not specified, the image is not scaled in height when drawn.
             *
             * @private
             */

            try {

                console.log(statusLabel[_status]);

                // get canvases
                const dataCanvas = dataCanvasRef.current;
                const renderCanvas = renderCanvasRef.current;

                // clear render canvas
                const rctx = renderCanvas.getContext('2d');
                rctx.clearRect(0, 0, renderCanvas.width, renderCanvas.height);
                renderCanvas.width = properties.render_dims.x;
                renderCanvas.height = properties.render_dims.y;

                // load data to render layer
                // - Image DOM element: drawImage
                // - ImageData object: putImageData
                if (inputImage instanceof HTMLImageElement) rctx.drawImage(
                    inputImage, 0, 0, properties.render_dims.x, properties.render_dims.y);
                else rctx.putImageData(inputImage, 0, 0);

                // set absolute client dimensions
                const bounds = baseCanvasRef.current.getBoundingClientRect();
                _updateProps({
                    'bounds': {
                        top: bounds.top,
                        left: bounds.left,
                        x: bounds.width,
                        y: bounds.height,
                    },
                });

                // clear data layer canvas
                const dctx = dataCanvas.getContext('2d');
                dctx.clearRect(0, 0, dataCanvas.width, dataCanvas.height);

                // draw image to data layer canvas
                dctx.imageSmoothingQuality = 'high';
                dctx.drawImage(
                    renderCanvas,
                    properties.offset.x,
                    properties.offset.y,
                    properties.render_dims.x,
                    properties.render_dims.y
                );

                // set status to loaded
                _setStatus(_LOADED);

            } catch (err) {
                _setStatus(_ERROR);
                console.warn(err);
            }
        }

        return (() => {
            _isMounted.current = false;
        });

    }, [
        _status,
        _setStatus,
        inputImage,
        setInputImage,
        dataCanvasRef,
        renderCanvasRef,
        properties,
        setProperties]);

    /**
     * Render Panel
     */
    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <PanelControls
                    disabled={_status !== _LOADED}
                    properties={properties}
                    pointer={pointer}
                    options={options}
                    callback={_callback}
                    setDialogToggle={setDialogToggle}
                />
                <div className={'canvas-layers'}>
                    <Magnifier
                        pointer={pointer}
                        properties={properties}
                        options={options}
                    />
                    {
                        _status !== _LOADED &&
                        <div
                            className={'layer canvas-placeholder'}
                            style={{
                                width: properties.base_dims.x,
                                height: properties.base_dims.y,
                                paddingTop: properties.base_dims.y / 2 - 10,
                            }}
                        >
                            {
                                _status !== _EMPTY
                                    ? <Button label={'Loading'} spin={true} icon={'spinner'}/>
                                    : <Button
                                        icon={'download'}
                                        label={'Click to load image'}
                                        onClick={_handleImageLoad}
                                    />
                            }
                        </div>
                    }
                    <canvas
                        ref={controlCanvasRef}
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
                        ref={markupCanvasRef}
                        id={`${id}_markup_layer`}
                        className={`layer canvas-layer-markup`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                    >
                        Markup Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={dataCanvasRef}
                        id={`${id}_data_layer`}
                        className={`layer canvas-layer-data${_status !== _LOADED ? 'hidden' : ''}`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={renderCanvasRef}
                        id={`${id}_render_layer`}
                        className={`layer canvas-layer-data hidden`}
                        width={properties.render_dims.x}
                        height={properties.render_dims.y}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={baseCanvasRef}
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
                <PanelInfo
                    properties={properties}
                    pointer={pointer}
                    status={statusLabel[_status]}/>
                <img
                    ref={imgRef}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={`Canvas ${id} loaded data.`}/>
            </div>
        </>;
};