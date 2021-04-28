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
import { getError } from '../../_services/schema.services.client';

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

    // loading status state
    const statusLabel = ['Empty', 'Loading', 'Loaded', 'Error'];
    const _EMPTY = 0, _LOADING = 1, _LOADED = 2, _ERROR = 3;
    const [status, setStatus] = React.useState(_EMPTY);

    /**
     * Handle input control errors.
     */

    const _handleControlError = (err) => {
        if (err) {
            console.warn(err);
            const msg = err || getError('default', 'canvas');
            setMessage({ msg: msg, type: 'error' });
        }
    };

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
        _handleControlError(error);
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
        _handleControlError(error);
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
        _handleControlError(error);
        return data;
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
        _handleControlError(error);
        return data;
    };

    /**
     * Handle canvas image loading.
     */

    const _handleImageLoad = () => {
        setDialogToggle({ type: 'selectImage', id: id });
    };


    /**
     * Load canvas data.
     */

    React.useEffect(() => {

        /**
         * Handle errors.
         */

        const _handleError = (err) => {
            console.warn(err);
            setStatus(_ERROR);
            setMessage(err);
        };

        try {
            _isMounted.current = true;

            /**
             * Convert data buffer array to image data.
             * @param data
             * @param w
             * @param h
             */

            const _toImageData = (data, w, h) => {
                return new ImageData(new Uint8ClampedArray(data), w, h);
            };

            /**
             * Load image data in canvas render layer.
             */

            function _loadRenderLayer(img, w, h) {

                // initialize render layer context
                const ctxRender = renderLayerRef.current.getContext('2d');
                renderLayerRef.current.width = w;
                renderLayerRef.current.height = h;
                ctxRender.clearRect(0, 0, w, h);

                // load data to render layer
                // - Image DOM element: drawImage
                // - ImageData object: putImageData
                if (img instanceof HTMLImageElement) ctxRender.drawImage(img, 0, 0);
                else ctxRender.putImageData(img, 0, 0);

                return ctxRender.getImageData(0, 0, w, h);
            }

            /**
             * Initialize source and edit layer image data.
             *
             * @private
             */

            function _loadDataLayer(imgData, w, h) {

                // get data layer context
                const ctxData = dataLayerRef.current.getContext('2d');

                // copy to source image data
                setSource(_toImageData(imgData.data, w, h));

                // initialize editable image date
                setInputImage(imgData);

                // put image data on edit layer
                ctxData.putImageData(imgData, 0, 0);

                // initialize canvas properties
                setProperties(data => ({
                    ...data,
                    reload: false,
                    file: null,
                    redraw: false,
                    edit_dims: { x: w, y: h },
                    source_dims: { x: w, y: h },
                    url: '',
                }));

                return imgData;
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
                console.log(`Loading ${mimeType} file.`);
                const _handlers = {
                    'image/tiff': () => {
                        loadTIFF(fileData)
                            .then(tiff => {
                                // convert data to Image Data object
                                const { width = 0, height = 0, data = [] } = tiff || {};
                                const imgData = _toImageData(data, width, height);
                                const rendered = _loadRenderLayer(imgData, width, height);
                                _loadDataLayer(rendered, width, height);
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
                            setStatus(_LOADED);
                        };
                        imgRef.current.src = src;
                    },
                };
                return _handlers.hasOwnProperty(mimeType) ? _handlers[mimeType]() : _handlers.default();
            }

            /**
             * Reset data layer to source data.
             *
             * @private
             */

            async function _reset() {

                if (!properties.reset) return;

                console.log('Reset', id);
                setStatus(_LOADING);

                const imgData = _toImageData(source.data, source.width, source.height);
                setInputImage(imgData);

                setProperties(data => ({ ...data, reset: false }));
                setStatus(_LOADED);
            }

            /**
             * Erase markup layer.
             *
             * @private
             */

            async function _erase() {

                if (!properties.erase) return;

                setStatus(_LOADING);
                console.log('Erase', id);

                const ctxMarkUp = markupLayerRef.current.getContext('2d');
                ctxMarkUp.clearRect(0, 0, properties.dims.x, properties.dims.y);

                setProperties(data => ({ ...data, erase: false }));
                setStatus(_LOADED);
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

                if (!properties.redraw) return;
                setStatus(_LOADING);
                console.log('Redraw', id);

                const dx = properties.offset.x;
                const dy = properties.offset.y;
                let dWidth = properties.edit_dims.x >> 0;
                let dHeight = properties.edit_dims.y >> 0;

                // check if input data is dirty
                // - reload data in render layer
                if (properties.dirty) {
                    console.log(inputImage);
                    _loadRenderLayer(inputImage, inputImage.width, inputImage.height);
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

                setProperties(data => ({ ...data, redraw: false, dirty: false }));
                setStatus(_LOADED);
            }


            /**
             * Load or redraw canvas layers.
             */


            // console.log('Rerender:', id, 'Status:', statusLabel[status], properties);

            // reject if data layer neither mounted nor ready in DOM
            if (!dataLayerRef.current || !_isMounted) return;

            // Processing error
            if (status === _ERROR && !properties.reload) {
                return
            }

            // Data not yet loaded or reloading
            if (status === _EMPTY || properties.reload) {

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

            // [redraw] redraw canvas on signal
            if (status === _LOADED) {

                // [reset] reset image data to source
                // [redraw] redraw image data onto data layer
                // [erase] clear markup layer
                    _reset()
                    .then(_redraw)
                    .then(_erase)
                    .catch(_handleError)
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
                    disabled={status !== _LOADED}
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
                            <th>Status:</th>
                            <td>{statusLabel[status]}</td>
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
                        status !== _LOADED &&
                        <div className={'layer canvas-placeholder'}>
                            {
                                status === _LOADING
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
                        className={`layer canvas-layer-data${status !== _LOADED ? ' hidden' : ''}`}
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
                <CanvasInfo id={id} properties={properties} options={options}/>
                <img
                    ref={imgRef}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={`Canvas ${id} loaded data.`}/>
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

export const initCanvas = (canvasID, inputData=null) => {

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
        reload: !!inputData,
        redraw: false,
        dirty: false,
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

