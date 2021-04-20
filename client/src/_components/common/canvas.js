/*!
 * MLP.Client.Components.Common.Canvas
 * File: canvas.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getPos, loadTIFF } from '../../_utils/image.utils.client';
import Button from './button';
import { CanvasControls} from '../menus/canvas.menu';
import { sanitize } from '../../_utils/data.utils.client';

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

    // source image data state
    const imgRef = React.useRef(null);
    const [sourceData, setSourceData] = React.useState(null);

    // create DOM references
    // - canvas consists of three layers (from top):
    // -- control layer to handle user events
    // -- markup layer to annotate image data
    // -- edit layer to display transformed image data
    // -- base layer
    const controlLayerRef = React.useRef(null);
    const markupLayerRef = React.useRef(null);
    const editLayerRef = React.useRef(null);
    const baseLayerRef = React.useRef(null);

    // error state
    const [error, setError] = React.useState(null);

    // /**
    //  * Get image pixel data.
    //  */
    //
    // const getImageData = () => {
    //
    //     // load canvas 1
    //     if (imgLayerRef.current && imgLayerRef.current.getContext) {
    //         let ctx = imgLayerRef.current.getContext('2d');
    //
    //         // Use a SIMD and DIMD global here?? Help JS with memory? (sourceImageData)
    //         let imgData = ctx.getImageData(0, 0, properties.dims.x, properties.dims.y);
    //
    //         ///if (!DIMD) DIMD = new ImageData( bcv1.width, bcv1.height );
    //         ///var dst = DIMD; // Will the JS lose track and delay garbage collect??
    //
    //         let dataBuffer = new Uint32Array(imgData.data.buffer);
    //         setImgData(dataBuffer);
    //         return dataBuffer;
    //     }
    // }
    //

    //
    // /**
    //  * Signal a redraw of the canvas.
    //  */
    //
    // const redraw = () => {
    //     setProperties(data => ({ ...data, redraw: true }));
    // }

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

        /**
         * Transform Image Data (Canvas API)
         * Reference: https://gist.github.com/mauriciomassaia/b9e7ef6667a622b104c00249f77f8c03
         *
         * @public
         * @param imageData
         * @param properties
         */

        async function redraw (imageData, properties) {

            const dx = properties.offset.x;
            const dy = properties.offset.y;
            const x = properties.edit_dims.x;
            const y = properties.edit_dims.y;

            const resizeWidth = x >> 0;
            const resizeHeight = y >> 0;
            const ibm = await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
                resizeWidth, resizeHeight
            });

            // set new canvas dimensions
            editLayerRef.current.width = Math.min(resizeWidth, properties.dims.x);
            editLayerRef.current.height = Math.min(resizeHeight, properties.dims.y);
            const ctxEdit = editLayerRef.current.getContext('2d');

            // Handle Markup: set points
            if (properties.pts.length === 0) {
                const ctxMarkUp = markupLayerRef.current.getContext('2d');
                ctxMarkUp.clearRect(0, 0, properties.dims.x, properties.dims.y)
            }

            //ctx.scale(resizeWidth / imageData.width, resizeHeight / imageData.height);
            ctxEdit.drawImage(ibm, dx, dy);
            return ctxEdit.getImageData(0, 0, resizeWidth, resizeHeight);
        }

        /**
         * Load or redraw canvas layers.
         */

        if (!editLayerRef.current) return;

        // get canvas layer contexts
        let ctxEdit = editLayerRef.current.getContext('2d');

        // Handle image data loaded from input
        if (!properties.loaded && properties.file) {

            // load TIFF format image
            loadTIFF(properties.file)
                .then(tiff => {
                    const imgData = new ImageData(
                        new Uint8ClampedArray(tiff.data),
                        tiff.width,
                        tiff.height,
                    );

                    // store source image data
                    setSourceData(imgData);

                    // put image data on edit layer
                    ctxEdit.putImageData(imgData, 0, 0);

                    // initialize canvas properties
                    setProperties(data => ({
                        ...data,
                        loaded: true,
                        redraw: false,
                        edit_dims: {
                            x: tiff.width,
                            y: tiff.height,
                        },
                        source_dims: {
                            x: tiff.width,
                            y: tiff.height,
                        },
                        url: '',
                    }));
                }).catch(err => {
                setError(true);
                console.error('Error:', err);
            });
        }

        // redraw canvas on signal
        if (properties.redraw) {
            setMessage(null);

            // put transformed data onto edit layer
            redraw(
                sourceData,
                properties
            ).then (res => {
                setProperties(data => ({ ...data, loaded: true, redraw: false }));
            }).catch(err => {
                console.error(err);
                setMessage({msg:'Error: could not complete operation.', type: 'error'});
            })

        }


    }, [error, id, sourceData, setSourceData, properties, setProperties, options, setMessage]);

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
                        ref={editLayerRef}
                        id={`${id}_edit_layer`}
                        className={`layer canvas-layer-edit`}
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
                }
                <CanvasInfo id={id} properties={properties} options={options} />
                {
                    // hidden image instance
                    properties && properties.url &&
                    <img ref={imgRef} src={properties.url} alt={`Canvas ${id} loaded data.`} />
                }
            </div>
        </>;
};

export default React.memo(Canvas);


/**
 * Initialize input data.
 * @param canvasID
 * @param inputData
 * @return {{dims: {x: number, y: number}, offset: {x: number, y: number}, hidden: boolean, origin: {x: number, y: number}, edit_dims: {x: number, y: number}, url: ({width: number}|number|{path: string, size: *}|string), pts: [], loaded: boolean, filename: string, files_id: string, file_type: string, id: string, source_dims: {x: number, y: number}, image_state: string}}
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
        url: url,
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
                <td colSpan={3}>{properties.filename} {properties.file_type ? `(${properties.file_type})` : '' }</td>
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