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
                           setImgData=noop,
                           hidden = false,
                           pointer = {},
                           setPointer = noop,
                           setMessage = noop,
                           setDialogToggle=noop,
                           onClick = noop,
                           onMouseMove = noop,
                       }) => {

    // create DOM references
    // - canvas consists of three layers (from top):
    // -- control layer to handle user events
    // -- markup layer to annotate image data
    // -- image layer to display image data
    // -- base layer
    const imgRef = React.useRef(null);
    const markupLayerRef = React.useRef(null);
    const controlLayerRef = React.useRef(null);
    const imgLayerRef = React.useRef(null);
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
    // /**
    //  * Draw image on canvas.
    //  * @param ctx
    //  * @param img
    //  * @param canvas
    //  */
    //
    // const draw = (ctx, img, canvas) => {
    //     setMessage(null);
    //     // clear canvas and redraw image data
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.drawImage(
    //         img,
    //         properties.offset.x,
    //         properties.offset.x,
    //         properties.img_dims.x,
    //         properties.img_dims.y,
    //     );
    //     setProperties(data => ({ ...data, loaded: true, redraw: false }));
    // };
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
            ...data, [id]: getPos(e, imgLayerRef.current),
        }));
    };

    /**
     * Handle canvas mouse move event.
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
            imgLayerRef.current,
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

        // load canvas
        if (imgLayerRef.current && imgLayerRef.current.getContext) {
            let ctx = imgLayerRef.current.getContext('2d');

            console.log(properties, properties.loaded, !!properties.file)

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

                        ctx.putImageData(imgData, 0, 0);
                        setProperties(data => ({
                            ...data,
                            loaded: true,
                            redraw: false,
                            img_dims: {
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



            // load image 1 (if available)
            if (imgRef.current) {

                // // redraw canvas on signal
                // if (imgRef.current.complete && properties.redraw) {
                //     draw(ctx, imgRef.current, imgLayerRef.current);
                // }
                // // redraw canvas on image load
                // imgRef.current.onload = () => {
                //     draw(ctx, imgRef.current, imgLayerRef.current);
                // };

            }
        }

    }, [error, id, imgLayerRef, imgRef, properties, setProperties, setMessage]);

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
                        onMouseMove={_handleMouseMove}
                        onMouseOut={_handleMouseOut}
                        onClick={_handleOnClick}
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
                        ref={imgLayerRef}
                        id={`${id}_image_layer`}
                        className={`layer canvas-layer-image`}
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
 * @return {{dims: {x: number, y: number}, offset: {x: number, y: number}, hidden: boolean, origin: {x: number, y: number}, img_dims: {x: number, y: number}, url: ({width: number}|number|{path: string, size: *}|string), pts: [], loaded: boolean, filename: string, files_id: string, file_type: string, id: string, img_original_dims: {x: number, y: number}, image_state: string}}
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
        origin: { x: 0, y: 0 },
        hidden: false,
        loaded: loaded,
        img_original_dims: { x: x_dim, y: y_dim },
        img_dims: { x: x_dim, y: y_dim },
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
                <th>Image</th>
                <td>({properties.img_dims.x}, {properties.img_dims.y})</td>
                <th>Canvas</th>
                <td>({properties.dims.x}, {properties.dims.y})</td>
            </tr>
            <tr>
                <th>Origin</th>
                <td>({properties.origin.x},{properties.origin.y})</td>
                <th>Move</th>
                <td>({properties.offset.x},{properties.offset.y})</td>
            </tr>
            <tr>
                <th>File</th>
                <td colSpan={3}>{properties.filename}</td>
            </tr>
            <tr>
                <th>(W, H)</th>
                <td colSpan={3}>
                    ({properties.img_original_dims.x}, {properties.img_original_dims.y})
                </td>
            </tr>
            </tbody>
        </table>
    </div>;
};