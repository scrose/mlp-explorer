/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getPos, loadTIFF } from './transform.iat';
import Button from '../../common/button';
import { useRouter } from '../../../_providers/router.provider.client';
import { createNodeRoute } from '../../../_utils/paths.utils.client';
import { schema } from '../../../schema';
import { getMIME } from '../../../_services/api.services.client';
import CanvasControls from './canvas.controls.iat';
import { saveAs } from 'file-saver';
import { initCanvas } from './iat';
import CanvasInfo from './canvas.info.iat';
import ControlPoints from './canvas.points.iat';
import Magnifier from './magnifier.iat';

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
 * @param dims
 * @param hidden
 * @param options
 * @param pointerProps
 * @param setPointerProps
 * @param setMessage
 * @param onClick
 * @param onMouseMove
 * @public
 */

export const PanelIat = ({
                             id = 'canvas0',
                             label = '',
                             options = {},
                             properties = {},
                             setProperties = noop,
                             trigger = null,
                             setTrigger = noop,
                             inputImage = null,
                             setInputImage = noop,
                             hidden = false,
                             pointerProps = {},
                             setPointerProps = noop,
                             setMessage = noop,
                             setDialogToggle = noop,
                             onClick = noop,
                             onMouseUp = noop,
                             onMouseDown = noop,
                             onMouseOver = noop,
                             onMouseOut = noop,
                             onMouseMove = noop,
                             onKeyDown = noop,
                         }) => {

    const router = useRouter();
    const _isMounted = React.useRef(false);

    // initialize actions
    const _NOOP = 0, _REDRAW = 1, _RELOAD = 2, _ERASE = 3, _SAVE = 4, _RESET=5;


    // create DOM references
    // - canvas consists of three layers (from top):
    // -- control layer to handle user events
    // -- markup layer to annotate image data
    // -- edit layer to display transformed image data
    // -- base layer
    const controlLayerRef = React.useRef(null);
    const markupLayerRef = React.useRef(null);
    const dataLayerRef = React.useRef(null);
    const renderLayerRef = React.useRef(null);
    const baseLayerRef = React.useRef(null);

    // create layers objects
    const layers = {
        control: controlLayerRef.current,
        markup: markupLayerRef.current,
        data: dataLayerRef.current,
        render: renderLayerRef.current,
        base: baseLayerRef.current,
    };

    // loading status state
    const statusLabel = ['Empty', 'Loading', 'Loaded', 'Error'];
    const _EMPTY = 0, _LOADING = 1, _LOADED = 2, _ERROR = 3;
    const [status, setStatus] = React.useState(_EMPTY);

    // source image data state (used for images referenced by URLs)
    const imgRef = React.useRef(null);

    // internal image data source
    // - used to reset canvas data
    const [source, setSource] = React.useState(null);

    // create wrapper for pointer operations
    const pointer = {
        get: () => {
            return pointerProps;
        },
        set: (e) => {
            const pos = getPos(e, layers.control);
            setPointerProps(data => ({ ...data, x: pos.x, y: pos.y }));
        },
        select: (x, y) => {
            setPointerProps(data => ({ ...data, selected: { x: x, y: y } }));
        },
        deselect: () => {
            setPointerProps(data => ({ ...data, selected: null }));
        },
        reset: () => {
            setPointerProps(data => ({ ...data, x: 0, y: 0, selected: null }));
        },
    };


    /**
     * Create wrapper for panel properties operations
     */
    const panel = {
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
            setProperties(initCanvas(id));
        },
    };

    /**
     * Handle input control errors.
     */

    const _handleControlError = (err) => {
        if (err) {
            console.warn(err);
            setMessage({ msg: err, type: 'error' });
        }
    };

    /**
     * Handle canvas event.
     * - reset pointer to (0, 0)
     */

    const _handleEvent = (e, _handler) => {
        const { data = {}, error = '' } = _handler(
            e,
            layers,
            panel,
            trigger,
            pointer,
            options
        ) || {};
        _handleControlError(error);
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
        pointer.set(e);
        return _handleEvent(e, onMouseDown);
    };

    /**
     * Handle canvas mouse over event.
     * - reset pointer to (0, 0)
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
     * Handle key presses.
     */

    const _handleOnKeyDown = (e) => {
        return _handleEvent(e, onKeyDown);
    };

    /**
     * Handle canvas image loading.
     */

    const _handleImageLoad = () => {
        setDialogToggle({ type: 'selectImage', id: id });
    };

    /**
     * Load canvas image data.
     */

    React.useEffect(() => {

        // create wrapper for panel properties operations
        const _panel = {
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
                setProperties(initCanvas(id));
            },
        };

        // create layers objects
        const _layers = {
            control: controlLayerRef.current,
            markup: markupLayerRef.current,
            data: dataLayerRef.current,
            render: renderLayerRef.current,
            base: baseLayerRef.current,
        };

        /**
         * Handle errors.
         */

        const _handleError = (err) => {
            console.warn(err);
            setTrigger(_NOOP);
            setStatus(_ERROR);
            setMessage(err);
        };

        try {
            _isMounted.current = true;

            /**
             * Converts data buffer array to image data.
             * @param data
             * @param w
             * @param h
             */

            const _toImageData = (data, w, h) => {
                return new ImageData(new Uint8ClampedArray(data), w, h);
            };

            /**
             * Loads image data to source state.
             * @private
             * @param img
             * @param w
             * @param h
             */

            function _loadSource(img, w, h) {

                // copy image data to source state as backup
                setSource(_toImageData(img.data, w, h));

                // copy editable image data state
                setInputImage(_toImageData(img.data, w, h));

                // update panel properties
                _panel.update({ source_dims: { x: w, y: h } });
            }

            /**
             * Loads render layer canvas. The render layer holds the full
             * image data on canvas for local processing and image transformations.
             * @private
             * @param img
             * @param w
             * @param h
             */

            function _loadRenderLayer(img, w, h) {

                console.log('Rendering', img, w, h);

                // initialize render layer context
                const ctxRender = renderLayerRef.current.getContext('2d');
                _layers.render.width = w;
                _layers.render.height = h;
                ctxRender.clearRect(0, 0, w, h);

                // update panel properties
                _panel.update({
                    render_dims: { x: w, y: h },
                    renderURL: renderLayerRef.current.toDataURL(),
                });

                // load data to render layer
                // - Image DOM element: drawImage
                // - ImageData object: putImageData
                if (img instanceof HTMLImageElement) ctxRender.drawImage(img, 0, 0);
                else ctxRender.putImageData(img, 0, 0);
                return ctxRender.getImageData(0, 0, w, h);

            }

            /**
             * Loads data layer canvas. The data layer shows the editable
             * view of the rendered image data. Image data is also stored
             * in the source state for resets.
             *
             * @private
             * @param {ImageData} img
             * @param {int} w
             * @param {int} h
             */

            function _loadDataLayer(img, w, h) {

                console.log('Load data layer', img, w, h);

                // get data layer context
                const ctxData = dataLayerRef.current.getContext('2d');

                // put image data on data layer canvas
                ctxData.putImageData(img, 0, 0);

                // update panel properties
                _panel.update({
                    file: null,
                    data_dims: {
                        x: Math.min(w, properties.base_dims.x),
                        y: Math.min(h, properties.base_dims.y),
                    },
                    dataURL: _layers.data.toDataURL(),
                });

                return img;
            }

            /**
             * Prepares file data for use in canvas layers.
             *
             * @param fileData
             * @param mimeType
             * @param url
             * @private
             */

            function _handleFileData(fileData = null, mimeType, url = '') {
                const _handlers = {
                    'image/tiff': () => {
                        loadTIFF(fileData)
                            .then(tiff => {
                                // convert data to Image Data object
                                const { width = 0, height = 0, data = [] } = tiff || {};
                                const imgData = _toImageData(data, width, height);
                                const rendered = _loadRenderLayer(imgData, width, height);
                                _loadDataLayer(rendered, width, height);
                                _loadSource(imgData, width, height);
                                setMessage({ msg: `Image loaded to ${label}.`, type: 'info' });
                                setStatus(_LOADED);
                            })
                            .catch(_handleError);
                    },
                    'default': () => {
                        const src = fileData ? URL.createObjectURL(fileData) : url;
                        imgRef.current.onerror = _handleError;
                        imgRef.current.onload = function() {
                            if (fileData) URL.revokeObjectURL(src); // free memory held by Object URL
                            const rendered = _loadRenderLayer(
                                imgRef.current,
                                imgRef.current.naturalWidth,
                                imgRef.current.naturalHeight,
                            );
                            _loadDataLayer(rendered, properties.source_dims.x, properties.source_dims.y);
                            _loadSource(rendered, imgRef.current.naturalWidth, imgRef.current.naturalHeight);
                            setMessage({ msg: `Image loaded to ${label}.`, type: 'info' });
                            setStatus(_LOADED);
                        };
                        imgRef.current.src = src;
                    },
                };
                return _handlers.hasOwnProperty(mimeType) ? _handlers[mimeType]() : _handlers.default();
            }

            /**
             * Reloads data layer from input data.
             *
             * @private
             */

            function _reload(override = false) {
                if (!override && trigger !== _RELOAD) return false;
                console.log('Reload', id);
                setStatus(_EMPTY);
            }

            /**
             * Creates a Blob object representing the image contained in
             * the canvas; this file may be cached on the disk or stored
             * in memory at the discretion of the user agent. If type
             * is not specified, the image type is image/png. The created
             * image is in a resolution of 96dpi.
             *
             * @private
             */

            function _save(override = false) {
                if (!override && (trigger !== _SAVE || !properties.blobType)) return false;
                setStatus(_LOADING);

                // create download filename
                const filename = `${id}.${properties.blobType.ext}`;
                console.log('Saving to file ...', filename);

                // save canvas blob as file to local disk (file-saver)
                _layers.render.toBlob((blob) => {
                    saveAs(blob, filename);
                    setStatus(_LOADED);
                    setTrigger(_NOOP);
                }, properties.blobType, properties.blobQuality);
            }

            /**
             * Resets data layer to source data.
             *
             * @private
             */

            async function _reset(override = false) {
                if (!override && trigger !== _RESET) return;
                console.log('Reset', id, source);
                setStatus(_LOADING);

                // get default dimensions
                const defaultDims = {
                    x: Math.min(source.width, options.defaultX),
                    y: Math.min(source.height, options.defaultY),
                };

                setInputImage(_toImageData(source.data, source.width, source.height));
                const rendered = _loadRenderLayer(source, defaultDims.x, defaultDims.y);
                _loadDataLayer(rendered, defaultDims.x, defaultDims.y);

                // update panel properties
                _panel.update({
                    render_dims: { x: source.width, y: source.height },
                    data_dims: defaultDims,
                });

                setStatus(_LOADED);
            }

            /**
             * Clears markup layer.
             *
             * @private
             */

            async function _erase(override = false) {
                if (!override && trigger !== _ERASE) return;
                setStatus(_LOADING);
                console.log('Erase', id);
                const ctxMarkUp = _layers.markup.getContext('2d');
                ctxMarkUp.clearRect(0, 0, properties.base_dims.x, properties.base_dims.y);
                setStatus(_LOADED);
            }

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

            async function _redraw(override = false) {

                if (!override && trigger !== _REDRAW) return;

                setStatus(_LOADING);
                console.log('Redraw', id);

                try {

                    // get data layer offset
                    const dx = properties.offset.x;
                    const dy = properties.offset.y;

                    // get data layer dims (upper limit is the base canvas)
                    const dWidth = Math.min(properties.data_dims.x, properties.base_dims.x);
                    const dHeight = Math.min(properties.data_dims.y, properties.base_dims.y);

                    // check if input data is dirty (e.g. transformed image data)
                    // - reload data in render layer
                    if (properties.dirty) {
                        console.log('Unrendered image data.');
                        _loadRenderLayer(inputImage, inputImage.width, inputImage.height);
                    }

                    // clear data layer canvas
                    const ctxData = _layers.data.getContext('2d');
                    ctxData.clearRect(0, 0, properties.base_dims.x, properties.base_dims.y);

                    // draw image to data layer canvas
                    ctxData.imageSmoothingQuality = 'high';
                    ctxData.drawImage(_layers.render, dx, dy, dWidth, dHeight);

                    // re-encode data url
                    _panel.set('dataURL', _layers.data.toDataURL());
                    setStatus(_LOADED);

                } catch (err) {
                    setMessage({ msg: err.message });
                }
            }

            /**
             * Apply triggered operation to canvas layers.
             */

            // reject if data layer is neither mounted nor ready in DOM
            if (!dataLayerRef.current || !_isMounted) return;

            // Data processing errors: reset canvas to empty
            if (status === _ERROR) {
                console.log('Error for:', id);
                setStatus(_EMPTY);
                _panel.reset();
                return;
            }

            // Data not yet loaded or is about to reload
            if (status === _EMPTY) {

                // [API] Handle image data downloaded from API
                // - download image file from MLP library
                // - stores in source/edit states
                if (properties.files_id && !properties.file) {

                    console.log('Downloading image from API ...');
                    setStatus(_LOADING);

                    // get file format and generate node route
                    const mimeType = getMIME(properties.filename);
                    const route = createNodeRoute(properties.file_type, 'download', properties.files_id);

                    // download image data to canvas
                    router.download(route, mimeType)
                        .then(res => {
                            if (res.error) return _handleError(res.error);
                            _handleFileData(res.data, mimeType);
                        })
                        .catch(_handleError);
                }

                // [file] Handle image data loaded from uploaded file
                // - loads TIFF format image data
                // - stores in source/edit states
                if (properties.file) {
                    console.log('Loading image from File...');
                    setStatus(_LOADING);
                    const mimeType = getMIME(properties.filename);
                    _handleFileData(properties.file, mimeType);
                }

                // [url] Handle image data loaded from URL
                // - loads image data from url
                // - stores in source/edit states
                if (properties.url) {
                    console.log('Downloading image from URL ...', properties.url);
                    setStatus(_LOADING);
                    const mimeType = getMIME(properties.filename);
                    _handleFileData(null, mimeType, properties.url);
                }

            }

            // filter requested canvas operations
            if (status === _LOADED) {

                // [reload] reload data from new source
                if (_reload()) return;

                // [reset] reset image data to source
                // [redraw] redraw image data onto data layer
                // [erase] clear markup layer
                // [magnify] show cursor magnification
                // [save] save blob data from render layer canvas to file
                _reset()
                    .then(_redraw)
                    .then(_erase)
                    .then(_save)
                    .then(() => {
                        setTrigger(_NOOP)
                    })
                    .catch(_handleError);
            }


        } catch (err) {
            _handleError(err);
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        router,
        status,
        setStatus,
        id,
        properties,
        setProperties,
        trigger,
        setTrigger,
        label,
        source,
        setSource,
        imgRef,
        inputImage,
        setInputImage,
        options,
        setMessage
    ]);

    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <CanvasControls
                    id={id}
                    disabled={status !== _LOADED}
                    panel={panel}
                    trigger={setTrigger}
                    pointer={pointer}
                    setMessage={setMessage}
                    setDialogToggle={setDialogToggle}
                />
                <div className={'canvas-layers'}>
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
                <Magnifier
                    enable={true}
                    pointer={pointer}
                    panel={panel}
                    options={options}
                />
                <ControlPoints
                    canvas={layers.markup}
                    panel={panel}
                    pointer={pointer}
                    trigger={trigger}
                    options={options}
                />
                <CanvasInfo
                    id={id}
                    properties={properties}
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

