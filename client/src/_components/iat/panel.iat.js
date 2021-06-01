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
import Cropper from './cropper.iat';
import { eraseOverlay } from './graphics.iat';
import useWindowSize from './window.iat';
import { getScale } from './transform.iat';

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
 * @param onMouseUp
 * @param onMouseDown
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
                             onMouseUp = noop,
                             onMouseDown = noop,
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
    // - default state: erase the canvas
    const [onDraw, setOnDraw] = React.useState(noop);

    // create canvas pointer.
    const pointer = usePointer(properties, options);

    // get window listener
    const [winW, winH] = useWindowSize();

    /**
     * Handle file processing and input control responses.
     * - sets signal status to:
     * -- load: loads image data into input and source states, draws to canvas
     * -- reload: loads updated image data into input, redraws to canvas
     * -- reset: loads source image data into input data state
     * -- save: saves current image data as downloadable
     * -- master: uploads current Panel 2 image as mastered modern capture image
     * -- draw: draws graphics to mask canvas
     */

    const _callback = (response) => {
        // console.log(response, pointer.selected)
        const {
            error = null,
            data = null,
            props = null,
            draw = noop,
            status = '',
            message = null,
        } = response || {};

        // handle error in response
        if (error) {
            console.warn(error);
            setSignal('error');
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
                    .then(() => {setSignal('loaded')})
                    .catch(err => {
                        console.error(err);
                        setSignal('error');
                    });
            },
            draw: () => {
                setOnDraw({ draw: draw });
            },
        };
        _methods.hasOwnProperty(status) ? _methods[status]() : noop();

        // update panel properties and set update signal
        if (props) {
            setProperties(data => (
                Object.keys(props).reduce((o, key) => {
                    o[key] = props[key];
                    return o;
                }, data)),
            );
            setSignal(status);
        }
    };

    /**
     * Handle canvas user event.
     */

    const _handleEvent = (e, _handler) => {
        const { data = {}, error = '' } = _handler(e, properties, pointer, options, _callback) || {};
        _callback(error);
        return data;
    };

    /**
     * Handle canvas mouse move event.
     * - deselect pointer selected point
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
     * Handle canvas mouse move event.
     * - set pointer to position (x, y) of cursor
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

        // reject if uninitialized DOM or loading
        if (!_isMounted.current || !viewCanvasRef.current || !imageCanvasRef.current || signal === 'loading') return;

        // get canvases
        const baseCanvas = baseCanvasRef.current;
        const controlCanvas = controlCanvasRef.current;
        const viewCanvas = viewCanvasRef.current;
        const imgCanvas = imageCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        const scratchCanvas = scratchCanvasRef.current;

        // get contexts
        const imgCtx = imgCanvas.getContext('2d');
        const viewCtx = viewCanvas.getContext('2d');
        const overlayCtx = overlayCanvas.getContext('2d');
        const scratchCtx = scratchCanvas.getContext('2d');

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
        const _updateImage = () => {

            // clear scratch canvas, resize and copy image data
            scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCanvas.width = imgCanvas.width;
            scratchCanvas.height = imgCanvas.height;
            scratchCtx.drawImage(imgCanvas, 0, 0);

            // clear image canvas, resize and copy scratch image data
            imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
            imgCanvas.width = properties.image_dims.w;
            imgCanvas.height = properties.image_dims.h;
            imgCtx.drawImage(
                scratchCanvas,
                properties.source_dims.x,
                properties.source_dims.y,
                properties.source_dims.w,
                properties.source_dims.h,
                0,
                0,
                properties.image_dims.w,
                properties.image_dims.h
            );

            // update image data state
            setInputImage(
                imgCtx.getImageData(0, 0, properties.image_dims.w, properties.image_dims.h)
            );
        };

        // convenience method for updating canvas rendered data
        const _updateView = () => {

            // clear view and overlay canvases
            viewCtx.clearRect(0, 0, viewCanvas.width, viewCanvas.height);
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

            // draw image data to crop [data] layer canvas
            // - use scaled render dimensions for image data
            viewCtx.imageSmoothingQuality = 'high';
            viewCtx.drawImage(
                imgCanvas,
                properties.render_dims.x,
                properties.render_dims.y,
                properties.render_dims.w,
                properties.render_dims.h,
            );
        };

        /**
         * Initialize panel grid.
         */

        const scale = getScale(properties);
        baseCanvas.style.backgroundImage = `url(${originMark}), url(${xTicks}), url(${yTicks}), url(${baseGrid})`;
        baseCanvas.style.backgroundRepeat = 'no-repeat, repeat-x, repeat-y, repeat';
        baseCanvas.style.backgroundPosition = 'bottom right, bottom left, top right, top left';
        baseCanvas.style.backgroundSize = `
            auto,
            ${Math.round(100 / scale.x)}px 10px, 
            10px ${Math.round(100 / scale.y)}px, 
            ${Math.floor(200 / scale.x)}px ${Math.floor(200 / scale.y)}px`;

        /**
         * Check for DOM dimension changes (e.g. due to window resize)
         */

        // get absolute control canvas dimensions
        const bounds = controlCanvas.getBoundingClientRect();

        if (
            bounds.top !== properties.bounds.top ||
            bounds.left !== properties.bounds.left ||
            bounds.width !== properties.bounds.w ||
            bounds.height !== properties.bounds.h
        ) {
            // update properties
            // - set canvas boundaries for pointer measurements
            _updateProps({
                bounds: {
                    top: bounds.top,
                    left: bounds.left,
                    w: bounds.width,
                    h: bounds.height,
                }
            });
        }

        /**
         * Convert canvas image data to blob
         */

        if (signal === 'blob') {
            setSignal('loading');
            imageCanvasRef.current.toBlob((blob) => {
                _updateProps({
                    blob: blob
                })
                setSignal('loaded');
            }, 'image/tiff', options.blobQuality);
        }

        /**
         * Clears panel markup
         * - remove control points
         * - remove crop box
         * */

        if (signal === 'view') {
            setSignal('loading');
            _updateView();
            setSignal('loaded');
        }

        /**
         * Clears panel markup
         * - remove control points
         * - remove crop box
         * */

        if (signal === 'clear') {
            eraseOverlay(overlayCtx, properties);
            pointer.resetSelectBox();
            setProperties(data => ({ ...data, pts: [] }));
            setSignal('loaded');
        }

        /**
         * Draws to overlay canvas (bitmap graphics)
         * - uses callback draw method
         * */

        if (signal === 'draw') {
            // apply requested drawing function
            onDraw.draw(overlayCtx, properties, properties.other_panel ? otherProperties : null);
            setSignal('loaded');
        }

        /**
         * Create data URL from image data.
         * */

        if (signal === 'data') {
            setSignal('loading');
            _updateProps({dataURL: imgCanvas.toDataURL()})
            setSignal('loaded');
        }

        /**
         * Update image data and render based on current panel properties
        */

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

                // set signal status to 'loading'
                setSignal('loading');

                // load image data to image canvas
                // - set image canvas to original dimensions
                // - Image DOM element: drawImage
                // - ImageData object: putImageData
                if (signal === 'load' || signal === 'reload' || signal === 'reset') {
                    imgCanvas.width = properties.original_dims.w;
                    imgCanvas.height = properties.original_dims.h;
                    if (inputImage instanceof HTMLImageElement) imgCtx.drawImage(
                        inputImage, 0, 0, properties.original_dims.w, properties.original_dims.h);
                    else imgCtx.putImageData(inputImage, 0, 0);
                }

                // copy image data to scratch canvas and back to image canvas
                // - needed to update image dimensions if resized
                _updateImage();

                // update rendered view of image
               _updateView();

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
        id,
        label,
        signal,
        setSignal,
        inputImage,
        setInputImage,
        source,
        setSource,
        pointer,
        viewCanvasRef,
        imageCanvasRef,
        properties,
        otherProperties,
        options,
        setProperties,
        onDraw,
        setDialogToggle,
        winW, winH
    ]);


    /**
     * Render Panel
     */
    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <PanelControls
                    disabled={signal === 'empty' || signal === 'loading'}
                    properties={properties}
                    setSignal={setSignal}
                    callback={_callback}
                    setDialogToggle={setDialogToggle}
                />
                <div className={'canvas-layers'}>
                    {
                        pointer.magnify &&
                        <Magnifier
                            canvas={viewCanvasRef.current}
                            pointer={pointer}
                            properties={properties}
                            options={options}
                        />
                    }
                    {
                        (!inputImage || signal === 'empty') &&
                        <div
                            className={'layer canvas-placeholder'}
                            style={{
                                width: properties.base_dims.w,
                                height: properties.base_dims.h,
                                paddingTop: properties.base_dims.h / 2 - 10,
                            }}
                        >
                            {
                                signal !== 'loading' && <Button
                                    icon={'image'}
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
                        className={`layer canvas-layer-control-${options.mode} ${pointer.magnify ? 'magnify' : ''}`}
                        width={properties.base_dims.w}
                        height={properties.base_dims.h}
                        onMouseUp={_handleMouseUp}
                        onMouseDown={_handleMouseDown}
                        onMouseMove={_handleMouseMove}
                        onMouseOut={_handleMouseOut}
                        onKeyDown={_handleOnKeyDown}
                        onKeyUp={_handleOnKeyUp} />
                    <canvas
                        ref={overlayCanvasRef}
                        id={`${id}_overlay_layer`}
                        className={`layer canvas-layer-overlay`}
                        width={properties.base_dims.w}
                        height={properties.base_dims.h}
                    />
                    <canvas
                        ref={viewCanvasRef}
                        id={`${id}_view_layer`}
                        className={`layer canvas-layer-view${signal !== 'loaded' && !inputImage ? 'hidden' : ''}`}
                        width={properties.base_dims.w}
                        height={properties.base_dims.h}
                    />
                    <canvas
                        ref={imageCanvasRef}
                        id={`${id}_render_layer`}
                        className={`layer canvas-layer-image hidden`}
                        width={properties.original_dims.w}
                        height={properties.original_dims.h}
                    />
                    <canvas
                        ref={scratchCanvasRef}
                        id={`${id}_scratch_layer`}
                        className={`layer canvas-layer-image hidden`}
                        width={properties.original_dims.w}
                        height={properties.original_dims.h}
                    />
                    <canvas
                        ref={baseCanvasRef}
                        id={`${id}_base_layer`}
                        style={{ backgroundImage: `url(${baseGrid})` }}
                        className={`canvas-layer-base`}
                        width={properties.base_dims.w + 10}
                        height={properties.base_dims.h + 10}
                    >
                        Canvas API Not Supported
                    </canvas>
                </div>
                {
                    inputImage && options.mode === 'crop' &&
                    <Cropper
                        properties={properties}
                        pointer={pointer}
                        callback={_callback}
                    />
                }
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