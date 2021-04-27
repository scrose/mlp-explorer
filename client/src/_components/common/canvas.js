/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getPos, loadTIFF } from '../../_utils/image.utils.client';
import Button from './button';
import { CanvasControls, CanvasInfo } from '../menus/canvas.menu';
import { useRouter } from '../../_providers/router.provider.client';
import { createNodeRoute } from '../../_utils/paths.utils.client';
import { schema } from '../../schema';
import { getMIME } from '../../_services/api.services.client';

/**
 * No operation.
 */

const noop = () => {
};

/**
 * Canvas Image Viewer component
 *
 * NOTES:
 * FILE: Adapted from Image Analysis Toolkit (IAT), Mike Whitney
 *
 * @param id
 * @param dims
 * @param hidden
 * @param options
 * @param pointer
 * @param setPointer
 * @param setMessage
 * @param onClick
 * @param onMouseMove
 * @public
 */

export const Canvas = ({
                           id = 'canvas0',
                           options = {},
                           setOptions = noop,
                           properties = {},
                           setProperties = noop,
                           inputImage = null,
                           setInputImage = noop,
                           hidden = false,
                           pointer = {},
                           setPointer = noop,
                           setMessage = noop,
                           setDialogToggle = noop,
                           onClick = noop,
                           onDragStart = noop,
                           onDrag = noop,
                           onMouseMove = noop,
                           onKeyDown = noop,
                       }) => {

    const router = useRouter();
    const _isMounted = React.useRef(false);

    // source image data state (used for images referenced by URLs)
    const imgRef = React.useRef(null);

    // internal image data source
    // - used to reset canvas data
    const [source, setSource] = React.useState(null);

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

    // loading state
    const [loading, setLoading] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    // error state
    const [error, setError] = React.useState(null);

    /**
     * Handle canvas mouse move event.
     */

    const _handleMouseMove = e => {
        setPointer(data => ({
            ...data, [id]: getPos(e, controlLayerRef.current),
        }));
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer to (0, 0)
     */

    const _handleMouseOut = () => {
        setPointer(data => ({
            ...data, [id]: { x: 0, y: 0 },
        }));
    };

    /**
     * Handle canvas mouse move event.
     */

    const _handleOnClick = e => {
        const { data = {}, error = '' } = onClick(
            e,
            markupLayerRef.current,
            properties,
            setProperties,
            options) || {};
        setMessage(null);
        if (error) setMessage({ msg: error, type: 'error' });
        return data;
    };

    /**
     * Handle canvas drag start event.
     */

    const _handleOnDragStart = e => {
        const { data = {}, error = '' } = onDragStart(
            e,
            controlLayerRef.current,
            properties,
            setProperties,
            options) || {};
        setMessage(null);
        if (error) setMessage({ msg: error, type: 'error' });
        return data;
    };

    /**
     * Handle canvas drag event.
     */

    const _handleOnDrag = e => {
        const { data = {}, error = '' } = onDrag(
            e,
            controlLayerRef.current,
            properties,
            setProperties,
            options) || {};
        setMessage(null);
        if (error) setMessage({ msg: error, type: 'error' });
        return data;
    };

    /**
     * Handle canvas image loading.
     */

    const _handleImageLoad = () => {
        setDialogToggle({ type: 'selectImage', id: id });
    };

    /**
     * Handle key presses.
     */

    const _handleOnKeyDown = (e) => {
        const { data = {}, error = '' } = onKeyDown(
            e,
            controlLayerRef.current,
            properties,
            setProperties,
            options) || {};
        setMessage(null);
        if (error) setMessage({ msg: error, type: 'error' });
        return data;
    };

    /**
     * Load canvas data.
     */

    React.useEffect(() => {
        try {
            _isMounted.current = true;

            /**
             * Initialize image data in render layer.
             */

            function _initImageData(img, w, h) {
                const ctxRender = renderLayerRef.current.getContext('2d');
                renderLayerRef.current.width = w;
                renderLayerRef.current.height = h;
                ctxRender.clearRect(0, 0, w, h);
                // load data to render layer
                if (img instanceof HTMLImageElement) ctxRender.drawImage(img, 0, 0);
                else ctxRender.putImageData(img, 0, 0);
                return ctxRender.getImageData(
                    0, 0, properties.source_dims.x, properties.source_dims.y);
            }

            /**
             * Initialize source and edit layer image data.
             *
             * @private
             */

            function _initCanvasData(imgData, w, h) {

                const imgDataSource = new ImageData(new Uint8ClampedArray(imgData.data), w, h);
                const imgDataEdit = new ImageData(new Uint8ClampedArray(imgData.data), w, h);

                // store source image data
                setSource(imgDataSource);
                // initialize editable image date
                setInputImage(imgDataEdit);

                // put image data on edit layer
                ctxData.putImageData(imgDataEdit, 0, 0);

                // initialize canvas properties
                setProperties(data => ({
                    ...data,
                    file: null,
                    redraw: false,
                    edit_dims: { x: w, y: h },
                    source_dims: { x: w, y: h },
                    url: '',
                }));

                return imgDataEdit;
            }

            /**
             * Prepare file data for use in canvas layers.
             *
             * @param fileData
             * @param mimeType
             * @param url
             * @private
             */

            function _handleFileData(fileData = null, mimeType, url = '') {
                const _handlers = {
                    'image/tiff': () => {
                        console.log('Loading TIFF image file.');
                        loadTIFF(fileData)
                            .then(tiff => {
                                console.log(tiff);
                                const imgData = _initCanvasData(tiff, tiff.width, tiff.height);
                                _initImageData(imgData, tiff.width, tiff.height);
                                setLoading(false);
                            }).catch(err => {
                            setError(true);
                            setMessage(err);
                        }).finally(() => {
                            setLoaded(true);
                            setLoading(false);
                        });
                    },
                    'default': () => {
                        const src = fileData ? URL.createObjectURL(fileData) : url;
                        imgRef.current.onerror = function() {
                            setError(true);
                            setLoaded(false);
                        };
                        imgRef.current.onload = function() {
                            if (fileData) URL.revokeObjectURL(src); // free memory held by Object URL
                            const imgData = _initImageData(
                                imgRef.current, imgRef.current.naturalWidth, imgRef.current.naturalHeight);
                            // initialize data canvas layer
                            _initCanvasData(imgData, properties.source_dims.x, properties.source_dims.y);
                            setLoading(false);
                            setLoaded(true);
                        };
                        imgRef.current.src = src;
                    },
                };
                return _handlers.hasOwnProperty(mimeType) ? _handlers[mimeType]() : _handlers.default();
            }

            /**
             * Erase markup layer.
             *
             * @private
             */

            async function _erase() {

                // Handle Markup: set points
                if (properties.pts.length === 0) {
                    const ctxMarkUp = markupLayerRef.current.getContext('2d');
                    ctxMarkUp.clearRect(0, 0, properties.dims.x, properties.dims.y);
                }
            }

            /**
             * Redraw Image Data to canvas (Canvas API)
             * Scale: set new data canvas dimensions
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

            async function _redraw() {

                console.log('Redraw');

                // erase markup
                _erase().catch((err) => {
                    console.warn(err);
                    setError(true);
                });

                const dx = properties.offset.x;
                const dy = properties.offset.y;
                let dWidth = properties.edit_dims.x >> 0;
                let dHeight = properties.edit_dims.y >> 0;

                // reset image data to source data
                if (properties.reset) {
                    dWidth = properties.source_dims.x >> 0;
                    dHeight = properties.source_dims.y >> 0;
                }

                // Get data context
                const ctxData = dataLayerRef.current.getContext('2d');

                // clear data canvas
                ctxData.clearRect(0, 0, properties.dims.x, properties.dims.y);

                // resize canvas
                dataLayerRef.current.width = Math.min(dWidth, properties.dims.x);
                dataLayerRef.current.height = Math.min(dHeight, properties.dims.y);

                // draw image to data canvas
                ctxData.imageSmoothingQuality = 'high';
                ctxData.drawImage(renderLayerRef.current, dx, dy, dWidth, dHeight);

                // return image data from data layer
                return ctxData.getImageData(0, 0, dWidth, dHeight);
            }


            /**
             * Load or redraw canvas layers.
             */


            console.log('Rerender:', id, 'Error:', error, 'Loading:', loading, properties);

            // reject if data layer neither mounted nor ready in DOM
            if (!dataLayerRef.current || !_isMounted) return;

            // get data layer context
            let ctxData = dataLayerRef.current.getContext('2d');

            // Data not yet loaded
            if (!loaded) {

                // Empty canvas
                if (!properties.url && !properties.files_id && !properties.file) {
                    setLoading(false);
                }

                // reset data if error occurred
                if (error) {
                    setProperties(initCanvas(id));
                    setError(false);
                }

                // return if loading is already in progress
                if (loading) return;

                // [url] Handle image data loaded from URL
                // - loads image data from url
                // - stores in source/edit states
                if (properties.url) {
                    setLoading(true);
                    console.log('Loading image from URL ...', properties.url);
                    const mimeType = getMIME(properties.filename);
                    _handleFileData(null, mimeType, properties.url);
                }

                // [API] Handle image data downloaded from API
                // - download image file from MLP library
                // - stores in source/edit states
                if (properties.files_id && !properties.file) {
                    console.log('Download image from API ...');

                    setLoading(true);

                    // get file format and generate node route
                    const mimeType = getMIME(properties.filename);
                    const route = createNodeRoute(properties.file_type, 'download', properties.files_id);

                    // download image data to canvas
                    router.download(route, mimeType)
                        .then(res => {
                            if (res.error) return setError(true);
                            _handleFileData(res.data, mimeType);
                        })
                        .catch((err) => {
                            console.error(err);
                            setError(true);
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }

                // [file] Handle image data loaded from uploaded file
                // - loads TIFF format image data
                // - stores in source/edit states
                if (properties.file) {
                    console.log('Loading image from File...');
                    setLoading(true);
                    const mimeType = getMIME(properties.filename);
                    _handleFileData(properties.file, mimeType);
                }

            }


            // [redraw] redraw canvas on signal
            if (loaded) {

                // [redraw] redraw image data onto data layer
                if (properties.redraw) {
                    setLoading(true);
                    _redraw()
                        .catch(err => {
                            console.warn(err);
                            setError(true);
                            setMessage({ msg: 'Error: could not complete operation.', type: 'error' });
                        })
                        .finally(() => {
                            setProperties(data => ({ ...data, redraw: false, reset: false }));
                            setLoading(false);
                        });
                }
                // [erase] Erase markup layer
                if (properties.erase) {
                    setLoading(true);
                    _erase()
                        .catch(err => {
                            console.warn(err);
                            setError(true);
                            setMessage({ msg: 'Error: could not complete operation.', type: 'error' });
                        })
                        .finally(() => {
                            setProperties(data => ({ ...data, erase: false }));
                            setLoading(false);
                        });
                }
            }
        } catch (err) {
            console.error(err);
            setMessage({ msg: 'Error: could not complete operation.', type: 'error' });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        router,
        error,
        loading,
        setLoading,
        id,
        source,
        setSource,
        imgRef,
        inputImage,
        setInputImage,
        properties,
        setProperties,
        options,
        setMessage,
    ]);

    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <CanvasControls
                    id={id}
                    disabled={!loaded}
                    options={options}
                    setOptions={setOptions}
                    setDialogToggle={setDialogToggle}
                    properties={properties}
                    update={setProperties}
                    setMessage={setMessage}
                />
                <div id={`canvas-view-${id}-header`} className={'canvas-view-info h-menu'}>
                    <table>
                        <tbody>
                        <tr>
                            <th>Cursor:</th>
                            <td>({pointer.x},{pointer.y})</td>
                            <th>Status: {loaded}</th>
                            <td>{loaded ? 'Loaded' : loading ? 'Loading' : 'Empty'}</td>
                        </tr>
                        <tr>
                            <th>Selected:</th>
                            <td colSpan={3}>
                                <div>
                                    {
                                        // show selected control points
                                        properties.pts.map((pt, index) => {
                                            return <Button
                                                key={`${id}_selected_pt_${index}`}
                                                icon={'crosshairs'}
                                                label={index + 1}
                                                title={`(${pt.x}, ${pt.y})`}
                                                onClick={() => {
                                                }}
                                            />;
                                        })
                                    }
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className={'canvas-layers'}>
                    {
                        !loaded &&
                        <div className={'layer canvas-placeholder'}>
                            {
                                loading
                                    ? <Button label={'Loading'} spin={true} icon={'spinner'} />
                                    : <Button
                                        icon={'download'}
                                        label={'Click to load image'}
                                        onClick={_handleImageLoad}
                                    />
                            }
                        </div>
                    }
                    {
                        loaded &&
                        <>
                            <canvas
                                ref={controlLayerRef}
                                id={`${id}_control_layer`}
                                className={`layer canvas-layer-control-${options.mode}`}
                                width={properties.dims.x}
                                height={properties.dims.y}
                                tabIndex={0}
                                draggable={true}
                                onMouseMove={_handleMouseMove}
                                onMouseOut={_handleMouseOut}
                                onClick={_handleOnClick}
                                onDragStart={_handleOnDragStart}
                                onDrag={_handleOnDrag}
                                onKeyDown={_handleOnKeyDown}
                            >
                                Control Layer: Canvas API Not Supported
                            </canvas>
                            <canvas
                                ref={markupLayerRef}
                                id={`${id}_markup_layer`}
                                className={`layer canvas-layer-markup`}
                                width={properties.dims.x}
                                height={properties.dims.y}
                            >
                                Markup Layer: Canvas API Not Supported
                            </canvas>
                            <canvas
                                ref={dataLayerRef}
                                id={`${id}_data_layer`}
                                className={`layer canvas-layer-data${!loaded ? ' hidden' : ''}`}
                                width={properties.dims.x}
                                height={properties.dims.y}
                            >
                                Image Layer: Canvas API Not Supported
                            </canvas>
                            <canvas
                                ref={renderLayerRef}
                                id={`${id}_render_layer`}
                                className={`layer canvas-layer-data hidden`}
                                width={properties.dims.x}
                                height={properties.dims.y}
                            >
                                Image Layer: Canvas API Not Supported
                            </canvas>
                        </>
                    }
                    <canvas
                        ref={baseLayerRef}
                        id={`${id}_base_layer`}
                        className={`canvas-layer-base`}
                        width={properties.dims.x}
                        height={properties.dims.y}
                    >
                        Base Layer: Canvas API Not Supported
                    </canvas>
                </div>
                <CanvasInfo id={id} properties={properties} options={options} />
                <img
                    ref={imgRef}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={`Canvas ${id} loaded data.`} />
            </div>
        </>;
};

/**
 * Initialize input data.
 * @param canvasID
 * @param inputData
 * @return {{dims: {x: number, y: number},
 * offset: {x: number, y: number},
 * hidden: boolean,
 * origin: {x: number, y: number},
 * edit_dims: {x: number, y: number},
 * url: ({width: number}|number|{path: string, size: *}|string),
 * pts: [], loaded: boolean, filename: string,
 * files_id: string,
 * file_type: string,
 * id: string,
 * source_dims: {x: number, y: number},
 * image_state: string}}
 */

export const initCanvas = (canvasID, inputData) => {

    // Destructure input data
    const {
        file = {},
        fileData = null,
        metadata = {},
        filename = '',
    } = inputData || {};
    const { id = '', file_type = '', file_size = 0 } = file || {};
    const { x_dim = 0, y_dim = 0, image_state = '' } = metadata || {};

    return {
        redraw: false,
        reset: false,
        restore: false,
        erase: false,
        id: canvasID,
        dims: { x: 350, y: 350 },
        offset: { x: 0, y: 0 },
        move: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        hidden: false,
        source_dims: { x: x_dim, y: y_dim },
        edit_dims: { x: x_dim, y: y_dim },
        files_id: id,
        filename: filename,
        file_type: file_type,
        file_size: file_size,
        file: fileData,
        url: null,
        pts: [],
        image_state: image_state,
    };
};

