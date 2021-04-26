/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getPos, loadTIFF, scale } from '../../_utils/image.utils.client';
import Button from './button';
import { CanvasControls} from '../menus/canvas.menu';
import { sanitize } from '../../_utils/data.utils.client';
import { getModelLabel } from '../../_services/schema.services.client';

/**
 * No operation.
 */

const noop = () => {};

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
                           id='canvas0',
                           options = {},
                           setOptions = noop,
                           properties = {},
                           setProperties = noop,
                           inputImage=null,
                           setInputImage=noop,
                           hidden = false,
                           pointer = {},
                           setPointer = noop,
                           setMessage = noop,
                           setDialogToggle=noop,
                           onClick = noop,
                           onDragStart=noop,
                           onDrag=noop,
                           onMouseMove = noop,
                       }) => {

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
        setDialogToggle({type: 'selectImage', id: id});
    };

    /**
     * Load canvas data.
     */

    React.useEffect(() => {
        try {
            /**
             * Initialize source and edit layer image data.
             *
             * @private
             */

            async function _init (imgData, w, h) {

                const imgDataSource = new ImageData(
                    new Uint8ClampedArray(imgData.data), w, h,
                );

                const imgDataEdit = new ImageData(
                    new Uint8ClampedArray(imgData.data), w, h,
                );

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
                    loaded: true,
                    redraw: false,
                    edit_dims: {
                        x: w,
                        y: h,
                    },
                    source_dims: {
                        x: w,
                        y: h,
                    },
                    url: '',
                }));
            }

            /**
             * Redraw Image Data to canvas (Canvas API)
             * Reference: https://gist.github.com/mauriciomassaia/b9e7ef6667a622b104c00249f77f8c03
             *
             * @private
             */

            async function _redraw () {

                console.log('Redraw', properties, inputImage);

                // reset image data to source
                if (properties.reset) {
                    setInputImage(new ImageData(
                        new Uint8ClampedArray(source.data),
                        source.width,
                        source.height,
                    ));
                }

                // Handle Markup: set points
                if (properties.pts.length === 0) {
                    const ctxMarkUp = markupLayerRef.current.getContext('2d');
                    ctxMarkUp.clearRect(0, 0, properties.dims.x, properties.dims.y)
                }

                // Get data context
                const ctxData = dataLayerRef.current.getContext('2d');
                const ctxRender = renderLayerRef.current.getContext('2d');

                /**
                 * Scale: set new data canvas dimensions
                 * - void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                 * - sx Optional
                 *   The x-axis coordinate of the top left corner of the sub-rectangle of the source
                 *   image to draw into the destination context.
                 * - sy Optional
                 *   The y-axis coordinate of the top left corner of the sub-rectangle of the source
                 *   image to draw into the destination context. Note that this argument is not
                 *   included in the 3- or 5-argument syntax.
                 * - sWidth Optional
                 *   The width of the sub-rectangle of the source image to draw into the destination
                 *   context. If not specified, the entire rectangle from the coordinates specified
                 *   by sx and sy to the bottom-right corner of the image is used.
                 * - sHeight Optional
                 *   The height of the sub-rectangle of the source image to draw into the destination
                 *   context. Note that this argument is not included in the 3- or 5-argument syntax.
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
                 */

                const sx = 0;
                const sy = 0;
                const dx = 0;
                const dy = 0;
                const sWidth = inputImage.width;
                const sHeight = inputImage.height;
                const dWidth = properties.edit_dims.x >> 0;
                const dHeight = properties.edit_dims.y >> 0;

                ctxRender.putImageData(inputImage, 0, 0);

                // clear data canvas
                ctxData.clearRect(0, 0, properties.dims.x, properties.dims.y);

                // resize data canvas
                dataLayerRef.current.width = dWidth;
                dataLayerRef.current.height = dHeight;

                ctxData.drawImage(renderLayerRef.current, 0, 0, dWidth, dHeight);

                //scale(renderLayerRef.current, dataLayerRef.current, resizeWidth, resizeHeight);

                console.log('Redraw:', inputImage, dWidth, dHeight)

                // redraw image from data
                return ctxData.getImageData(0, 0, dWidth, dHeight);
            }


            /**
             * Load or redraw canvas layers.
             */

            // reject if layer not ready in DOM
            if (!dataLayerRef.current) return;

            // get canvas layer contexts
            let ctxData = dataLayerRef.current.getContext('2d');

            // [url] Handle image data loaded from URL
            // - loads image data from url
            // - stores in source/edit states
            if (!properties.loaded && properties.url) {
                console.log('Load from URL:', properties)
                imgRef.current.onload = function() {
                    ctxData.drawImage(imgRef.current, 0, 0);
                    const imgData = ctxData.getImageData(
                        0, 0, properties.source_dims.x, properties.source_dims.y);
                    return _init(imgData, properties.source_dims.x, properties.source_dims.y);
                };
            }

            // [file] Handle image data loaded from input file
            // - loads TIFF format image data
            // - stores in source/edit states
            if (!properties.loaded && properties.file) {
                console.log('Load from File:', properties)
                loadTIFF(properties.file)
                    .then(tiff => {
                        return _init(tiff, tiff.width, tiff.height);
                    }).catch(err => {
                    setError(true);
                    console.error('Error:', err);
                });
            }

            // [redraw] redraw canvas on signal
            if (properties.redraw) {
                // put transformed data onto edit layer
                _redraw()
                    .then(res => {
                        setProperties(data => ({
                            ...data,
                            loaded: true,
                            redraw: false,
                            reset: false
                        }));
                    }).catch(err => {
                    console.error(err);
                    setMessage({ msg: 'Error: could not complete operation.', type: 'error' });
                })
            }
        } catch (err) {
            console.error(err);
            setMessage({ msg: 'Error: could not complete operation.', type: 'error' });
        }


    }, [
        error,
        id,
        source,
        setSource,
        imgRef,
        inputImage,
        setInputImage,
        properties,
        setProperties,
        options,
        setMessage
    ]);

    return !hidden && Object.keys(properties).length > 0 &&
        <>
            <div className={'canvas'}>
                <CanvasControls
                    id={id}
                    options={options}
                    setOptions={setOptions}
                    setDialogToggle = {setDialogToggle}
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
                        </tr>
                        <tr>
                            <th>Selected:</th>
                            <td>
                                <div>
                                    {
                                        // show selected control points
                                        properties.pts.map((pt, index) => {
                                            return  <Button
                                                key={`${id}_selected_pt_${index}`}
                                                icon={'crosshairs'}
                                                label={index + 1}
                                                title={`(${pt.x}, ${pt.y})`}
                                                onClick={()=>{}}
                                            />
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
                        !properties.loaded &&
                        <div className={'layer canvas-placeholder'}>
                            <Button
                                icon={'download'}
                                label={'Click to load image'}
                                onClick={_handleImageLoad}
                            />
                        </div>
                    }
                    <canvas
                        ref={controlLayerRef}
                        id={`${id}_control_layer`}
                        className={`layer canvas-layer-control-${options.mode}`}
                        width={properties.dims.x}
                        height={properties.dims.y}
                        draggable={true}
                        onMouseMove={_handleMouseMove}
                        onMouseOut={_handleMouseOut}
                        onClick={_handleOnClick}
                        onDragStart={_handleOnDragStart}
                        onDrag={_handleOnDrag}
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
                        className={`layer canvas-layer-data${!properties.loaded ? ' hidden' : ''}`}
                        width={properties.dims.x}
                        height={properties.dims.y}
                    >
                        Image Layer: Canvas API Not Supported
                    </canvas>
                    <canvas
                        ref={renderLayerRef}
                        id={`${id}_edit_layer`}
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
                <CanvasInfo id={id} properties={properties} options={options} />
                {
                    // hidden image instance
                    properties &&
                    <img ref={imgRef} crossOrigin={'anonymous'} src={properties.url} alt={`Canvas ${id} loaded data.`} />
                }
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
        file={},
        fileData=null,
        metadata={},
        url='',
        filename='',
        loaded=false} = inputData || {};
    const {id='', file_type='', file_size=0} = file || {};
    const {x_dim=0, y_dim=0, image_state=''} = metadata || {};

    return {
        redraw: false,
        reset: false,
        restore: false,
        id: canvasID,
        dims: { x: 350, y: 350 },
        offset: { x: 0, y: 0 },
        move: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        hidden: false,
        loaded: loaded,
        source_dims: { x: x_dim, y: y_dim },
        edit_dims: { x: x_dim, y: y_dim },
        files_id: id,
        filename: filename,
        file_type: file_type,
        file_size: file_size,
        file: fileData,
        url: url.hasOwnProperty('medium') ? url.medium : '',
        pts: [],
        image_state: image_state,
    }
}

/**
 * Canvas info status.
 *
 * @param id
 * @param properties
 * @param options
 * @public
 */

const CanvasInfo = ({ id, properties, options }) => {
    return <div id={`canvas-view-${id}-footer`} className={'canvas-view-info'}>
        <table>
            <tbody>
            <tr>
                <th>File</th>
                <td colSpan={3}>{properties.filename} {
                    properties.file_type ? `(${getModelLabel(properties.file_type)})` : '' }</td>
            </tr>
            <tr>
                <th>Image</th>
                <td>({properties.edit_dims.x}, {properties.edit_dims.y})</td>
                <th>Canvas</th>
                <td>({properties.dims.x}, {properties.dims.y})</td>
            </tr>
            <tr>
                <th>Origin</th>
                <td>({properties.origin.x},{properties.origin.y})</td>
                <th>Offset</th>
                <td>(
                    {Math.floor(properties.offset.x).toFixed(2)},
                    {Math.floor(properties.offset.y).toFixed(2)}
                    )
                </td>
            </tr>
            <tr>
                <th>(W, H)</th>
                <td>
                    ({properties.source_dims.x}, {properties.source_dims.y})
                </td>
                <th>Size</th>
                <td colSpan={3}>{sanitize(properties.file_size, 'filesize')}</td>
            </tr>
            </tbody>
        </table>
    </div>;
};