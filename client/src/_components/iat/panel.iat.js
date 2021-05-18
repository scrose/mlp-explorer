/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import PanelControls from './panel.controls.iat';
import PanelInfo from './panel.info.iat';
import ControlPoints, { usePointer } from './pointer.iat';
import Magnifier from './magnifier.iat';
import { loadImageData } from './loader.iat';
import { downloader } from './downloader.iat';
import baseGrid from '../svg/grid.svg';
import xTicks from '../svg/x-ticks.svg';
import yTicks from '../svg/y-ticks.svg';
import originMark from '../svg/origin.svg';

/**
 * No operation.
 */

const noop = () => {};


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
                             otherProperties = {},
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
    // - canvas consists of six canvases (from top):
    // -1- control canvas to handle user events
    // -2- overlay canvas to overlay graphics on image layer
    // -3- view canvas to show selected rendering of image
    // -4- (hidden) image canvas to hold transformed image data
    // -5- (hidden) scratch canvas as temporary rendering canvas
    // -6- base canvas to set absolute size of panel view
    const controlCanvasRef = React.useRef(null);
    const overlayCanvasRef = React.useRef(null);
    const viewCanvasRef = React.useRef(null);
    const imageCanvasRef = React.useRef(null);
    const scratchCanvasRef = React.useRef(null);
    const baseCanvasRef = React.useRef(null);

    // internal image data source
    // - used to reset canvas data
    const [source, setSource] = React.useState(null);

    // draw method state
    const [onDraw, setOnDraw] = React.useState({draw: noop});

    // redraw method state
    const [onRedraw, setOnRedraw] = React.useState({draw: noop});

    // create canvas pointer.
    const pointer = usePointer(properties, options);

    /**
     * Handle file processing and input control responses.
     * - sets signal status to:
     * -- load: loads image data into input and source states, draws to canvas
     * -- reload: loads updated image data into input, redraws to canvas
     * -- reset: loads source image data into input data state
     * -- save: saves current image data as downloadable
     * -- master: uploads current Panel 2 image as mastered modern capture image
     * -- draw: draws graphics to mask canvas (no clear)
     * -- redraw: draws graphics to mask canvas (with clear)
     */

    const _callback = (response) => {
       // console.log(response)
        const {
            error = null,
            data = null,
            props = null,
            redraw = noop,
            draw = noop,
            status = '',
            message = null
        } = response || {};

        // handle error in response
        if (error) {
            console.warn(error);
            setSignal( status || 'error' );
            setMessage(error);
            return;
        }
        // handle message in response
        if (message) setMessage(message);

        // update methods (see descriptions above)
        const _methods = {
            cancel: () => {
                if (!inputImage) return setSignal('empty');
                return setSignal('loaded');
            },
            load: () => {
                setSource(data);
                setInputImage(data);
            },
            reload: () => {
                setInputImage(data);
            },
            reset: () => {
                setInputImage(source);
            },
            save: () => {
                // copy current image data to download module
                downloader(id, imageCanvasRef.current, props)
                    .then(setSignal('loaded'))
                    .catch(err => {console.error(err); setSignal('error')});
            },
            draw: () => {
                setOnDraw({ draw: draw });
                if (!props) setSignal(status);
            },
            redraw: () => {
                setOnRedraw({ draw: redraw });
            }
        }
        _methods.hasOwnProperty(status) ? _methods[status]() : noop();

        // update panel properties and set update signal
        if (props) {
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
        const { data = {}, error = '' } = _handler(e, properties, pointer, options, _callback) || {};
        _callback(error);
        return data;
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer selection to (0, 0)
     */

    const _handleMouseUp = (e) => {
        pointer.deselect();
        return _handleEvent(e, onMouseUp);
    };

    /**
     * Handle canvas mouse down event.
     * - add selected click coordinate to pointer
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

        // convenience method for updating canvas image data
        const _updateCanvas = (canvas, width, height, offsetX, offsetY) => {

            // get scratch canvas ready and copy current data
            const scratchCanvas = scratchCanvasRef.current;
            const scratchCtx = scratchCanvas.getContext('2d');
            scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCanvas.width = canvas.width;
            scratchCanvas.height = canvas.height;
            scratchCtx.drawImage(canvas, offsetX, offsetY, canvas.width, canvas.height);

            // copy scratch canvas data back to data canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(scratchCanvas, offsetX, offsetY, width, height);
            return ctx.getImageData(0, 0, width, height);
        };

        // reject if uninitialized DOM
        if (!_isMounted.current || !viewCanvasRef.current || !imageCanvasRef.current) return;

        // get canvases
        const baseCanvas = baseCanvasRef.current;
        const controlCanvas = controlCanvasRef.current;
        const viewCanvas = viewCanvasRef.current;
        const imgCanvas = imageCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;

        // get contexts
        const imgCtx = imgCanvas.getContext('2d');
        const viewCtx = viewCanvas.getContext('2d');
        const overlayCtx = overlayCanvas.getContext('2d');

        /**
         * Initialize panel grid.
         */

        baseCanvas.style.backgroundImage = `url(${originMark}), url(${xTicks}), url(${yTicks}), url(${baseGrid})`;
        baseCanvas.style.backgroundRepeat = 'no-repeat, repeat-x, repeat-y, repeat';
        baseCanvas.style.backgroundPosition = 'bottom right, bottom left, top right, top left';

        /**
         * Upload image data as master.
         */

        if (signal === 'master') {
            // save canvas blob as TIFF file to upload to library
            imageCanvasRef.current.toBlob((blob) => {
                setDialogToggle({
                    type: 'masterImage',
                    id: id,
                    label: label,
                    data: blob,
                    callback: (data) => {
                        console.log(data)
                    },
                });
            }, 'image/tiff', options.blobQuality);
            setSignal('loaded')
        }

        /**
         * Draws mask canvas (bitmap graphics)
         * - uses callback draw method
         * */

        if (signal === 'draw') {
            // apply requested drawing method
            onDraw.draw(overlayCtx, properties, properties.other_panel ? otherProperties : null);
            setSignal('loaded');
        }

        /**
         * Redraws mask canvas (bitmap graphics)
         * - clears the mask canvas before drawing
         * - uses callback draw method
         * */

        if (signal === 'redraw') {
            // clear mask canvas
            overlayCtx.clearRect(0, 0, properties.base_dims.w, properties.base_dims.h);
            // apply requested drawing method
            // - overlay other panel control points (optional)
            onRedraw.draw(overlayCanvas, properties, properties.other_panel ? otherProperties : null);
            setSignal('loaded');
        }

        // update image data and render based on current panel properties
        // [1] Re-render request
        // [2] Image mastering request
        if (signal === 'render' || signal === 'load' || signal === 'reload' || signal === 'reset') {

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

                // load updated image data to image canvas
                // - Image DOM element: drawImage
                // - ImageData object: putImageData
                if (signal === 'load' || signal === 'reload' || signal === 'reset') {
                    setSignal('loading');
                    if (inputImage instanceof HTMLImageElement) imgCtx.drawImage(
                        inputImage, 0, 0, properties.original_dims.w, properties.original_dims.h);
                    else imgCtx.putImageData(inputImage, 0, 0);
                }
                setSignal('loading');

                // copy image data to scratch canvas and back to image canvas
                const imgData = _updateCanvas(
                    imgCanvas,
                    properties.image_dims.w,
                    properties.image_dims.h,
                    0, 0
                );

                // update image data
                setInputImage(imgData);

                // clear view and mask canvases
                viewCtx.clearRect(0, 0, viewCanvas.width, viewCanvas.height);
                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

                // draw image data to crop [data] layer canvas
                // - use scaled render dimensions for image data
                viewCtx.imageSmoothingQuality = 'high';
                // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                viewCtx.drawImage(
                    imgCanvas,
                    properties.source_dims.x,
                    properties.source_dims.y,
                    properties.source_dims.w,
                    properties.source_dims.h,
                    properties.render_dims.x,
                    properties.render_dims.y,
                    properties.render_dims.w,
                    properties.render_dims.h
                );

                // get absolute base canvas dimensions
                const bounds = controlCanvas.getBoundingClientRect();

                // update properties
                // - set canvas boundaries for pointer measurements
                // - reset control points
                // - create new data URL from image data
                _updateProps({
                    bounds: {
                        top: bounds.top,
                        left: bounds.left,
                        w: bounds.width,
                        h: bounds.height,
                    },
                    pts: [],
                    dataURL: imgCanvas.toDataURL(),
                });

                // load source if empty
                if (!source) setSource(inputImage);

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
        id, label,
        pointer,
        signal,
        setSignal,
        inputImage,
        setInputImage,
        source,
        setSource,
        viewCanvasRef,
        imageCanvasRef,
        properties,
        otherProperties,
        options,
        setProperties,
        onDraw,
        onRedraw,
        setDialogToggle
    ]);


    /**
     * Render Panel
     */
    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <PanelControls
                    disabled={signal === 'empty'}
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
                        (!inputImage || signal !== 'loaded') &&
                        <div
                            className={'layer canvas-placeholder'}
                            style={{
                                width: properties.base_dims.w,
                                height: properties.base_dims.h,
                                paddingTop: properties.base_dims.h / 2 - 10,
                            }}
                        >
                            {
                                signal === 'empty'
                                    ? <Button
                                        icon={'import'}
                                        label={'Click to load image'}
                                        onClick={_handleImageLoad}
                                    />
                                    : <Button label={'Loading'} spin={true} icon={'spinner'}/>
                            }
                        </div>
                    }
                    <canvas
                        ref={controlCanvasRef}
                        id={`${id}_control_layer`}
                        tabIndex={0}
                        className={`layer canvas-layer-control-${options.mode}${ pointer.magnify ? ' magnify' : ''}`}
                        width={properties.base_dims.w}
                        height={properties.base_dims.h}
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
                        ref={overlayCanvasRef}
                        id={`${id}_overlay_layer`}
                        className={`layer canvas-layer-overlay`}
                        width={properties.base_dims.w}
                        height={properties.base_dims.h}
                    >
                        Markup Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={viewCanvasRef}
                        id={`${id}_view_layer`}
                        className={`layer canvas-layer-view${signal !== 'loaded' && !inputImage ? 'hidden' : ''}`}
                        width={properties.base_dims.w}
                        height={properties.base_dims.h}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={imageCanvasRef}
                        id={`${id}_render_layer`}
                        className={`layer canvas-layer-image hidden`}
                        width={properties.original_dims.w}
                        height={properties.original_dims.h}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={scratchCanvasRef}
                        id={`${id}_scratch_layer`}
                        className={`layer canvas-layer-image hidden`}
                        width={properties.original_dims.w}
                        height={properties.original_dims.h}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={baseCanvasRef}
                        id={`${id}_base_layer`}
                        style={{ backgroundImage: `url(${baseGrid})` }}
                        className={`canvas-layer-base`}
                        width={properties.base_dims.w + 10}
                        height={properties.base_dims.h + 10}
                    >
                        Base Layer: Canvas API Not Supported
                    </canvas>
                </div>
                <ControlPoints
                    properties={properties}
                    otherProperties={otherProperties}
                    callback={_callback}
                />
                <PanelInfo
                    properties={properties}
                    pointer={pointer}
                    status={signal}
                    options={options}
                />
            </div>
        </>;
};