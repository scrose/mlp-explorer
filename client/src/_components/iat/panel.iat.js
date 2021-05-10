/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { schema } from '../../schema';
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
                             signal,
                             setSignal,
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

    // component mounted
    const _isMounted = React.useRef(false);

    // create DOM references
    // - canvas consists of three layers (from top):
    // -- control layer to handle user events
    // -- mask layer to overlay graphics on image layer
    // -- edit layer to display transformed image data
    // -- base layer
    const controlCanvasRef = React.useRef(null);
    const maskCanvasRef = React.useRef(null);
    const cropCanvasRef = React.useRef(null);
    const imageCanvasRef = React.useRef(null);
    const baseCanvasRef = React.useRef(null);

    // source image data state (used for images referenced by URLs)
    const imgRef = React.useRef(null);

    // internal image data source
    // - used to reset canvas data
    const [source, setSource] = React.useState(null);

    // draw method
    const [onRedraw, setOnRedraw] = React.useState({draw: noop});

    /**
     * Create pointer.
     */

    const pointer = usePointer(properties, options);

    /**
     * Handle file processing and input control responses.
     */

    const _callback = (response) => {
        console.log(response)
        const {
            error = null,
            data = null,
            props = {},
            point = null,
            magnify = false,
            redraw = noop,
            status = ''
        } = response || {};
        if (point) {
            pointer.setControl(point.control)
        }
        if (error || response.hasOwnProperty('message')) {
            console.warn(error);
            setSignal('error');
            setMessage(error);
            return;
        }
        // update local states
        if (status === 'load') {
            setInputImage(data);
            setSource(data);
        }
        if (status === 'reset') {
            setInputImage(source);
        }
        if (status === 'save') {
            // copy current image data to download module
            downloader(id, imageCanvasRef.current, props)
                .then(setSignal('loaded'))
                .catch(err => {console.error(err); setSignal('error')});
        }
        if (status === 'redraw') {
            setOnRedraw({ draw: redraw });
        }
        if (magnify) {
            // include data URL for magnification
            props.dataURL = cropCanvasRef.current.toDataURL();
        }
        if (status === 'render' || status === 'load' || status === 'reset' || status === 'redraw') {
            setProperties(data => (
                Object.keys(props).reduce((o, key) => {
                    o[key] = props[key];
                    return o;
                }, data)),
            );
            setSignal(status)
        }

    };

    /**
     * Handle canvas event.
     * - reset pointer to (0, 0)
     */

    const _handleEvent = (e, _handler) => {
        const { data = {}, error = '' } = _handler(e, properties, pointer.get(), options, _callback) || {};
        _callback(error);
        return data;
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer to (0, 0)
     */

    const _handleMouseUp = (e) => {
        pointer.deselect();
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
     * Handle canvas image loading. (Also available in panel controls).
     */

    const _handleImageLoad = () => {
        setSignal('loading');
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
        if (!_isMounted.current || !cropCanvasRef.current || !imageCanvasRef.current) return;

        /**
         * Redraws mask canvas (bitmap graphics)
         * - uses callback draw method
         * */

        // console.log(signal, properties, onRedraw);


        if (signal === 'redraw') {
            const maskCanvas = maskCanvasRef.current;

            // clear mask canvas
            const mctx = maskCanvas.getContext('2d');
            mctx.clearRect(0, 0, properties.base_dims.x, properties.base_dims.y);

            // apply requested drawing method
            onRedraw.draw(maskCanvas, properties);
            setSignal('loaded');
        }

        // update image data and render based on current panel properties
        // [1] Re-render request
        // [2] Image mastering request
        if (signal === 'render' || signal === 'load' || signal === 'reset') {

            if (signal === 'load' || signal === 'reset') setSignal('loading');

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

                // get canvases
                const cropCanvas = cropCanvasRef.current;
                const imgCanvas = imageCanvasRef.current;

                // clear image canvas
                const rctx = imgCanvas.getContext('2d');
                rctx.clearRect(0, 0, properties.image_dims.x, properties.image_dims.y);

                // load data to render layer
                // - Image DOM element: drawImage
                // - ImageData object: putImageData
                if (inputImage instanceof HTMLImageElement) rctx.drawImage(
                    inputImage, 0, 0, properties.source_dims.x, properties.source_dims.y);
                else rctx.putImageData(inputImage, 0, 0);

                // clear data layer canvas
                const dctx = cropCanvas.getContext('2d');
                dctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

                // update crop dimensions
                cropCanvas.width = properties.crop_dims.x;
                cropCanvas.height = properties.crop_dims.y;

                // draw image data to crop [data] layer canvas
                // - use scaled render dimensions for image data
                dctx.imageSmoothingQuality = 'high';
                dctx.drawImage(
                    imgCanvas,
                    properties.offset.x,
                    properties.offset.y,
                    properties.render_dims.x,
                    properties.render_dims.y
                );

                // get absolute base canvas dimensions
                const bounds = baseCanvasRef.current.getBoundingClientRect();

                // update properties
                _updateProps({
                    bounds: {
                        top: bounds.top,
                        left: bounds.left,
                        x: bounds.width,
                        y: bounds.height,
                    }
                });

                // load source if empty
                if (!source) setSource(inputImage)

                // set status to loaded
                setSignal('loaded');

            } catch (err) {
                setSignal('error');
                console.warn(err);
            }
        }

        return (() => {
            _isMounted.current = false;
        });

    }, [
        signal,
        setSignal,
        inputImage,
        setInputImage,
        source,
        setSource,
        cropCanvasRef,
        imageCanvasRef,
        properties,
        setProperties,
        onRedraw
    ]);

    /**
     * Render Panel
     */
    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <PanelControls
                    disabled={signal !== 'loaded' && signal !== 'render'}
                    properties={properties}
                    setSignal={setSignal}
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
                        ( signal === 'loading' || signal === 'empty' ) &&
                        <div
                            className={'layer canvas-placeholder'}
                            style={{
                                width: properties.base_dims.x,
                                height: properties.base_dims.y,
                                paddingTop: properties.base_dims.y / 2 - 10,
                            }}
                        >
                            {
                                signal === 'loading'
                                    ? <Button label={'Loading'} spin={true} icon={'spinner'}/>
                                    : <Button
                                        icon={'import'}
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
                        ref={maskCanvasRef}
                        id={`${id}_mask_layer`}
                        className={`layer canvas-layer-mask`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                    >
                        Markup Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={cropCanvasRef}
                        id={`${id}_data_layer`}
                        className={`layer canvas-layer-data${signal !== 'loaded' && !inputImage ? 'hidden' : ''}`}
                        width={properties.base_dims.x}
                        height={properties.base_dims.y}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={imageCanvasRef}
                        id={`${id}_render_layer`}
                        className={`layer canvas-layer-data hidden`}
                        width={properties.source_dims.x}
                        height={properties.source_dims.y}
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
                    callback={_callback}
                />
                <PanelInfo
                    properties={properties}
                    pointer={pointer}
                    status={signal}/>
                <img
                    ref={imgRef}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={`Canvas ${id} loaded data.`}/>
            </div>
        </>;
};