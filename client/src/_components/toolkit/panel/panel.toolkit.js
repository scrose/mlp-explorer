/*!
 * MLE.Client.Components.Toolkit.Panel
 * File: panel.toolkit.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Toolkit panel component is the main container for the canvas stack and integrates referenced DOM
 * elements with panel state changes and user mouse and key events. The toolkit makes extensive
 * use of the Canvas API for image rendering and markup. Image transformations use the OpenCV.js
 * JavaScript libraries.
 *
 * Each panel uses the following canvas layers (from top):
 * 1. Control canvas to handle user events
 * 2. [hidden] Magnifier canvas
 * 3. Overlay canvas A to overlay graphics on image layer
 * 4. Overlay canvas B to overlay graphics on image layer
 * 5. View canvas to show image visible (rendered) in browser
 * 6. [hidden] Magnified image canvas
 * 7. [hidden] Image canvas to store full-sized image and transformed image data
 * 8. Base or Grid canvas to set absolute size of panel view and background grid
 *
 * ---------
 * Revisions
 * - 09-07-2023   Major upgrade to Toolkit incl. UI and workflow improvements and OpenCV integration
 */

import React, {memo, useEffect, useRef, useState} from 'react';
import saveAs from 'file-saver';
import PanelMenu from './menu.panel.toolkit';
import PanelInfo from './info.panel.toolkit';
import Register from '../tools/register.toolkit';
import MagnifierTool from '../tools/magnifier.toolkit';
import baseGrid from '../../svg/grid.svg';
import CropTool, {cropImage} from '../tools/cropper.toolkit';
import {useIat} from "../../../_providers/toolkit.provider.client";
import Canvas from "../canvas/default.canvas.toolkit";
import {getScale, inRange, scalePoint, scaleToFit} from "../tools/scaler.toolkit";
import {loadImage} from "../utils/loader.utils.toolkit";
import LoadButton from "./placeholder.panel.toolkit";
import {useController} from "./controller.panel.toolkit";
import Grid from "../canvas/grid.canvas.toolkit";
import {UserMessage} from "../../common/message";
import Overlay from "../canvas/overlay.canvas.toolkit";
import {getError} from "../../../_services/schema.services.client";
import {getPos} from "../tools/pointer.toolkit";
import {useWindowSize} from "../../../_utils/events.utils.client";
import {alignImages} from "../utils/align.utils.toolkit";

/**
 * IAT panel component.
 *
 * NOTES:
 * Reference: Some features adapted from Image Analysis Toolkit (IAT), Mike Whitney
 *
 * @param id
 * @public
 */

const PanelToolkit = ({id = null}) => {

    const iat = useIat();
    const panel = iat[id];
    const controller = useController(id);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // alignment status
    const [aligned, setAligned] = useState(false);

    // create DOM references
    // - canvas consists of seven canvases (from top):
    // -1- control canvas to handle user events
    const controlLayer = useRef(null);
    // -2- (hidden) magnifier canvas
    const magnifierLayer = useRef(null);
    // -3- overlay canvas to overlay graphics on image layer
    const overlayLayer2 = useRef(null);
    // -4- overlay canvas to overlay graphics on image layer
    const overlayLayer1 = useRef(null);
    // -5- view canvas to show image visible in browser
    const viewLayer = useRef(null);
    // -6- (hidden) magnified image canvas
    const magnifiedLayer = useRef(null);
    // -7- (hidden) full-sized image canvas to hold transformed image data
    const imageLayer = useRef(null);
    // -8- base canvas to set absolute size of panel view
    const gridLayer = useRef(null);

    /**
     * Initialize panel properties and canvas boundaries for pointer measurements on image load
     *
     * @param {Object} props
     * @private
     */

    const _init = (props) => {
        const bounds = viewLayer.current.bounds();
        const renderDims = viewLayer.current.dims();
        panel.update({
            ...props,
            render_dims: {x: 0, y: 0, w: renderDims.w, h: renderDims.h},
            bounds: bounds
        });
    };

    /**
     * Realign panel bounds to current canvas view
     * - ensures accurate mouse position
     *
     * @private
     */

    const _resetBounds = () => {
        const bounds = viewLayer.current.bounds();
        // update panel properties
        panel.update({bounds: bounds});
        return bounds;
    }


    /**
     * Update magnified image after new render
     *
     * @private
     */

    const _updateMagnified = (imageDims) => {
        // compute scaled image dimensions of full magnified image
        const imgW = imageDims ? imageDims.w : panel.properties.image_dims.w;
        const imgH = imageDims ? imageDims.h : panel.properties.image_dims.h;
        const magDims = scaleToFit(imgW, imgH, iat.options.maxMagnifiedWidth, iat.options.maxMagnifiedHeight);

        // compute up scale
        const scaleUp = getScale({w: imgW, h: imgH}, magDims);

        // compute magnified offset
        const _x = Math.round(scaleUp.x * panel.properties.render_dims.x);
        const _y = Math.round(scaleUp.y * panel.properties.render_dims.y);

        // DEBUG
        // console.log(scaleUp, _x, _y, imgH, imgW, magDims)

        // store scaled image in magnified layer
        magnifiedLayer.current.draw(imageLayer.current.canvas(), {view: {x: _x, y: _y, w: magDims.w, h: magDims.h}, source: imageDims});
        panel.update({magnified_dims: magDims});
    }

    /**
     * Draw image to view layer canvas
     *
     * @private
     * @param viewDims
     * @param imageDims
     */

    const render = (viewDims, imageDims) => {
        try {
            viewLayer.current.draw(imageLayer.current.canvas(), {view: viewDims, source: imageDims});
            // store image data
            panel.setImage(imageLayer.current.getImageData());
            panel.setRendered(viewLayer.current.getImageData());
            // update image for magnification
            _updateMagnified(imageDims);
            // update panel state
            panel.setProperties(prevState => ({...prevState, render_dims: viewDims }));

        } catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {}
    };

    /**
     * Save image state
     *
     * @private
     */

    const save = () => {
        try {
            // store image data as source
            panel.setSource(imageLayer.current.getImageData());
            // update panel properties
            panel.setProperties(prevState => ({...prevState,
                source_dims: {
                    w: panel.properties.image_dims.w,
                    h: panel.properties.image_dims.h,
                },
            }));
            iat.setMessage({msg: 'Source image updated to current image.', type: 'success'});
        } catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {}
    };

    /**
     * Update image data based on properties
     *
     * @private
     */

    const update = () => {
        // compute scaled dimensions to fit view canvas
        const dims = scaleToFit(
            panel.properties.source_dims.w,
            panel.properties.source_dims.h,
            panel.properties.base_dims.w,
            panel.properties.base_dims.h,
        );
        // store image in render layer
        imageLayer.current.load(panel.image);
        // render image in view layer
        render(
            {x: 0, y: 0, w: dims.w, h: dims.h},
            {x: 0, y: 0, w: panel.properties.source_dims.w, h: panel.properties.source_dims.h}
        );
    }

    /**
     * convenience method for clearing the canvas overlay layer
     * */

    const clear = () => {
        // clear canvas of graphics / markup
        overlayLayer1.current.clear();
        // clear control points
        panel.pointer.clearPoints();
    }

    /**
     * convenience method for resetting the image data and metadata from the panel
     * */

    const remove = () => {
        // clear canvas of graphics / markup
        clear();
        // clear panel metadata
        panel.reset();
        // clear canvases
        imageLayer.current.clear();
        overlayLayer2.current.clear();
        viewLayer.current.clear();
        magnifiedLayer.current.clear();
        panel.setStatus('empty');
    }

    /**
     * fit image in canvas view.
     * */

    const fit = () => {
        clear();
        // compute scaled dimensions
        const dims = scaleToFit(
            panel.properties.image_dims.w,
            panel.properties.image_dims.h,
            panel.properties.base_dims.w,
            panel.properties.base_dims.h,
        );
        render(
            { x: 0, y: 0, w: dims.w, h: dims.h },
            { x: 0, y: 0, w: panel.properties.image_dims.w, h: panel.properties.image_dims.h }
        );
    }

    /**
     * expand image to full size in canvas view.
     * */

    const expand = () => {
        clear();
        render(
            { x: 0, y: 0, w: panel.properties.image_dims.w, h: panel.properties.image_dims.h },
            { x: 0, y: 0, w: panel.properties.image_dims.w, h: panel.properties.image_dims.h }
        );
    }

    /**
     * convenience method for zooming into view
     * */

    const zoomIn = () => {
        clear();
        render({
                x: Math.round(panel.properties.render_dims.x * 1.1),
                y: Math.round(panel.properties.render_dims.y * 1.1),
                w: Math.round(panel.properties.render_dims.w * 1.1),
                h: Math.round(panel.properties.render_dims.h * 1.1)
            },
            { x: 0, y: 0, w: panel.properties.image_dims.w, h: panel.properties.image_dims.h }
        );
    }

    /**
     * convenience method for zooming out of view
     * */

    const zoomOut = () => {
        clear();
        render({
                x: Math.round(panel.properties.render_dims.x / 1.1),
                y: Math.round(panel.properties.render_dims.y / 1.1),
                w: Math.round(panel.properties.render_dims.w / 1.1),
                h: Math.round(panel.properties.render_dims.h / 1.1)
            },
            { x: 0, y: 0, w: panel.properties.image_dims.w, h: panel.properties.image_dims.h });
    }

    /**
     * convenience method for resizing dimensions of image
     * */

    const resize = ({base_dims, image_dims}) => {
        clear();

        // scale image
        // destructure CV image processor
        try {
            const {cv=null} = iat.cv;

            // create src/dst image matrices
            let src = cv.imread(imageLayer.current.canvas());
            let dst = new cv.Mat();
            let dsize = new cv.Size(image_dims.w, image_dims.h);

            // resize src -> dst image dimensions
            cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);

            // convert to ImageData datatype and save to state
            const dstData = new Uint8ClampedArray(dst.data);
            const dstImageData = new ImageData(dstData, image_dims.w, image_dims.h);
            panel.setImage(dstImageData);

            // store image in render layer
            imageLayer.current.load(dstImageData);
            // update panel properties
            panel.update({
                image_dims: {
                    x: 0,
                    y: 0,
                    w: image_dims.w,
                    h: image_dims.h,
                },
                base_dims: {
                    w: base_dims.w || panel.properties.base_dims.w,
                    h: base_dims.h || panel.properties.base_dims.h
                }
            });
            // free up matrix memory
            src.delete(); dst.delete();
        }
        catch (e) {
            console.error(e);
            panel.setStatus('error');
        }
    }

    /**
     * Handle start of panning.
     */

    const panStart = () => {

    };

    /**
     * Pan over image
     * - set pointer to position (x, y) of cursor
     */

    const pan = (e, properties, pointer) => {
        try {
            // check that mouse start position was selected
            if (!pointer.selected) return;

            e.preventDefault();

            // compute distance traveled
            const _x = properties.render_dims.x + pointer.x - pointer.selected.x;
            const _y = properties.render_dims.y + pointer.y - pointer.selected.y;

            const viewDims = {
                x: _x,
                y: _y,
                w: properties.render_dims.w,
                h: properties.render_dims.h
            }

            // reset pointer selected coordinate
            pointer.setSelect({ x: pointer.x, y: pointer.y });
            // render panned image
            viewLayer.current.draw(imageLayer.current.canvas(), {view: viewDims, source: properties.image_dims});
            // update panel state
            panel.setProperties(prevState => ({...prevState, render_dims: viewDims }));

        } catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {}
    };

    /**
     * End panning
     * - reset pointer to (0, 0)
     */

    const panEnd = (e, properties) => {
        try {
            // compute scaled image dimensions of full magnified image
            const imgW = properties.image_dims.w;
            const imgH = properties.image_dims.h;
            const magDims = scaleToFit(imgW, imgH, iat.options.maxMagnifiedWidth, iat.options.maxMagnifiedHeight);

            // compute up scale
            const scaleUp = getScale({w: imgW, h: imgH}, magDims);

            // compute magnified offset
            const _x = Math.round(scaleUp.x * properties.render_dims.x);
            const _y = Math.round(scaleUp.y * properties.render_dims.y);

            // DEBUG
            // console.log(scaleUp, _x, _y, imgH, imgW, magDims)

            // store scaled image in magnified layer
            magnifiedLayer.current.draw(imageLayer.current.canvas(), {
                view: {x: _x, y: _y, w: magDims.w, h: magDims.h},
                source: properties.image_dims
            });
            panel.update({magnified_dims: magDims});
        } catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {}
    };

    /**
     * Crop image by pointer selected dimensions.
     * - sets image source data to the (x,y) offset and (w,h) dimensions
     *   of the selected crop box to draw to the render canvas.
     */

    const crop = () => {
        try {
            iat[id].setStatus('loading');
            // destructure CV image processor
            const {cv = null} = iat.cv;
            // check that mouse start position was selected
            if (!panel.pointer.selectBox) return;

            // is the crop box empty? If so, return.
            if (panel.pointer.selectBox.w === 0 && panel.pointer.selectBox.h === 0) return;

            // crop image
            cropImage(cv, imageLayer.current.canvas(), panel.image, panel.pointer.selectBox);

            // compute scaled dimensions to fit view canvas
            const scaledDims = scaleToFit(
                panel.pointer.selectBox.w,
                panel.pointer.selectBox.h,
                panel.properties.base_dims.w,
                panel.properties.base_dims.h
            );

            // render image in view layer
            clear();
            render(
                {x: 0, y: 0, w: scaledDims.w, h: scaledDims.h},
                {x: 0, y: 0, w: panel.pointer.selectBox.w, h: panel.pointer.selectBox.h}
            );

            // update panel state
            panel.setProperties(prevState => ({
                ...prevState,
                image_dims: {
                    w: panel.pointer.selectBox.w,
                    h: panel.pointer.selectBox.h,
                },
                render_dims: {
                    w: scaledDims.w,
                    h: scaledDims.h,
                    x: 0, y: 0

                }
            }));

            // reset selection box
            panel.pointer.setSelectBox({x: 0, y: 0, w: 0, h: 0});

            iat[id].setStatus('loaded');
        }
        catch (e) {
            console.error(e);
            iat[id].setStatus('error');
            iat.setMessage({msg: 'Image could not be cropped.', type: 'error'});
        }
    }

    /**
     * Move crop bounding box.
     *
     * @public
     * @param e
     * @param properties
     * @param pointer
     */

    const cropMove = (e, properties, pointer) => {

        // check that mouse start position was selected
        if (!pointer.selected) return;

        e.preventDefault();

        // compute down scale
        const scaleDown = getScale(properties.render_dims, properties.image_dims);

        // compute new coordinates using distance travelled
        const _x = Math.round(scaleDown.x * pointer.selectBox.x) + pointer.x - pointer.selected.x;
        const _y = Math.round(scaleDown.y * pointer.selectBox.y) + pointer.y - pointer.selected.y;
        const _w = Math.round(scaleDown.x * pointer.selectBox.w);
        const _h = Math.round(scaleDown.y * pointer.selectBox.h);

        // update the pointer selected point
        pointer.setSelect({ x: pointer.x, y: pointer.y });

        // compute up scale
        const scaleUp = getScale(properties.image_dims, properties.render_dims);

        // update the pointer select box
        // - use magnitude value of width/height
        pointer.setSelectBox({
            x: Math.round(scaleUp.x * _x),
            y: Math.round(scaleUp.y * _y),
            w: pointer.selectBox.w,
            h: pointer.selectBox.h
        });

        // update crop box boundary
        overlayLayer1.current.drawBoundingBox(_x, _y, _w, _h);
    }


    /**
     * Start image crop bounding box.
     *
     * @public
     * @param e
     * @param properties
     * @param pointer
     */

    const cropStart = (e, properties, pointer) => {
        // scale point coordinate
        const scaledPt = scalePoint(pointer, properties.image_dims, properties.render_dims);
        // determine if pointer coordinate is inside crop box
        const inRange =
            pointer.selectBox.w > 0 && pointer.selectBox.h > 0 &&
            scaledPt.x >= pointer.selectBox.x && scaledPt.x <= pointer.selectBox.x + pointer.selectBox.w &&
            scaledPt.y >= pointer.selectBox.y && scaledPt.y <= pointer.selectBox.y + pointer.selectBox.h

        // if inside box, operation is to move the existing crop box
        if (inRange) {
            panel.setMethods({
                onMouseDown: cropStart,
                onMouseUp: cropEnd,
                onMouseMove: cropMove,
                onMouseOut: cropEnd
            });
        }
        // otherwise start new crop box
        else {
            pointer.setSelectBox({
                x: scaledPt.x,
                y: scaledPt.y,
                w: 0,
                h: 0,
            });

            // start crop box boundary
            overlayLayer1.current.drawBoundingBox(0, 0, 0, 0);
        }

    }

    /**
     * convenience method for ending crop box selection
     * */

    const cropEnd = (e, properties, pointer) => {
        // reset selection box if no image in panel
        if (!panel.image
            || panel.status !== 'loaded'
            || pointer.selectBox.w === 0
            || pointer.selectBox.h === 0) {
            clear();
            pointer.resetSelectBox();
        }
        else {
            // set pointer select box to image overlap if dimensionless or out-of-bounds of image
            const _x = Math.round(Math.max(Math.min(pointer.selectBox.x, properties.image_dims.w), 0));
            const _y = Math.round(Math.max(Math.min(pointer.selectBox.y, properties.image_dims.h), 0));

            // check if crop box goes outside bounds of image and crop to area that overlaps
            const _w = pointer.selectBox.x + pointer.selectBox.w > properties.image_dims.w
                ? properties.image_dims.w - Math.abs(pointer.selectBox.x)
                : pointer.selectBox.x < 0
                    ? pointer.selectBox.w - Math.abs(pointer.selectBox.x)
                    : pointer.selectBox.w;
            const _h = pointer.selectBox.y + pointer.selectBox.h > properties.image_dims.h
                ? properties.image_dims.h - Math.abs(pointer.selectBox.y)
                : pointer.selectBox.y < 0
                        ? pointer.selectBox.h - Math.abs(pointer.selectBox.y)
                        : pointer.selectBox.h;

            // update the pointer select box
            pointer.setSelectBox({x: _x, y: _y, w: _w, h: _h});

            // compute select box dimensions
            const scale = getScale(properties.render_dims, properties.image_dims);

            // update crop box view
            overlayLayer1.current.drawBoundingBox(
                Math.round(scale.x * _x),
                Math.round(scale.y * _y),
                Math.abs(Math.round(scale.x * _w)),
                Math.abs(Math.round(scale.y * _h))
            );
        }

        // reset crop methods
        panel.setMethods({
            onMouseDown: cropStart,
            onMouseUp: cropEnd,
            onMouseMove: cropBound,
            onMouseOut: cropEnd
        });
    }

    /**
     * Update canvas offset by cursor position
     * @param e
     * @param properties
     * @param pointer
     */

    const cropBound = (e, properties, pointer) => {
        // check that mouse start position was selected
        if (!pointer.selected) return;

        e.preventDefault();

        // compute select box dimensions
        const scale = getScale(properties.image_dims, properties.render_dims);
        // (x,y) = top-left corner coordinate
        const _x = Math.min(pointer.x, pointer.selected.x);
        const _y = Math.min(pointer.y, pointer.selected.y);
        const _w = properties.render_dims.x + pointer.x - pointer.selected.x;
        const _h = properties.render_dims.y + pointer.y - pointer.selected.y;

        // update the pointer select box
        // - use magnitude value of width/height
        pointer.setSelectBox({
            x: Math.round(scale.x * _x),
            y: Math.round(scale.y * _y),
            w: Math.abs(Math.round(scale.x * _w)),
            h: Math.abs(Math.round(scale.y * _h))
        });

        // update crop box boundary
        overlayLayer1.current.drawBoundingBox(pointer.selected.x, pointer.selected.y, _w, _h);
    }

    /**
     * Adjust crop box dimensions
     * @param x
     * @param y
     * @param w
     * @param h
     */

    const cropAdjust = (x, y, w, h) => {
        overlayLayer1.current.drawBoundingBox(x, y, w, h);
    }


    /**
     * convenience method for zooming out of view
     * */

    const setControlPoint = (e, properties, pointer) => {
        // realign bounds to current canvas view
        // - ensures accurate mouse position
        const bounds = _resetBounds();
        // get current pointer position on view canvas
        const pos = getPos(e, {
            base_dims: properties.base_dims,
            bounds: bounds
        }) || {};
        // create array for canvas points
        const pts = [];
        // calculate actual image pixel location
        const actual = scalePoint(pos, properties.image_dims, properties.render_dims);
        // get control point options
        const {ptrRadius, controlPtMax} = iat.options || {};

        // get current set control points
        let controlPoints = [...pointer.points];

        // check if mouse cursor within defined radius to existing control point
        let selected = false;
        controlPoints.forEach((ctrlPt, index) => {
            // scale control point to render view
            const pt = scalePoint(ctrlPt, properties.render_dims, properties.image_dims);
            // add scaled point to array
            pts.push(pt);
            if (inRange(pos.x, pos.y, pt.x, pt.y, ptrRadius)) {
                // set pointer control point index
                selected = true;
                pointer.setIndex(index);
            }
        });

        // do nothing if control point index if proximate
        // - signals move control point
        if (selected) return;

        // check if the maximum number of control points has been reached
        if (controlPoints.length >= controlPtMax)
            return iat.setMessage(getError('maxControlPoints', 'canvas'));
            // otherwise, append new control point to saved coordinates
        // - update control points set in pointer
        else {
            // DEBUG
            // console.log('Draw tools:', pts, controlPoints, pos, actual, panel.properties.render_dims, panel.properties.image_dims, bounds)
            controlPoints.push(actual);
            pointer.setPoints(controlPoints);
            overlayLayer1.current.drawControlPoints(pts);
        }
    }

    /**
     * Deselect control points.
     *
     * @public
     * @return {Object}
     */

    const deselectControlPoint = () => {
        panel.pointer.setIndex(-1);
    };

    /**
     * Get local mouse position on canvas.
     * Reference: http://jsfiddle.net/m1erickson/sEBAC/
     *
     * @public
     */

    const moveControlPoint = (e, properties, pointer) => {

        // proceed if mouse is down (selected point)
        if (!pointer.selected || pointer.index < 0) return;

        // get the current selected control point position
        const ctrlPt = pointer.points[pointer.index];
        if (!ctrlPt) return;

        // scale point to view dimensions
        const pt = scalePoint(ctrlPt, properties.render_dims, properties.image_dims);

        // compute distance traveled
        const _x = pt.x + pointer.x - pointer.selected.x;
        const _y = pt.y + pointer.y - pointer.selected.y;

        // update the pointer selected point
        pointer.setSelect({x: _x, y: _y});

        // update panel control point position
        const controlPoints = [...pointer.points];
        controlPoints[pointer.index] = scalePoint({
            x: _x,
            y: _y
        }, panel.properties.image_dims, panel.properties.render_dims);
        pointer.setPoints(controlPoints);
        // redraw points on overlay canvas
        overlayLayer1.current.clear();
        overlayLayer1.current.drawControlPoints(controlPoints);
    };

    /**
     * Load image data to canvas
     * */

    const load = (props) => {

        panel.setStatus('loading');

        loadImage(props, (response) => {

            // destructure loaded data
            const {data = null, props = null, error = null} = response || {};

            if (error) {
                console.error(error);
                panel.setStatus('empty');
                return iat.setMessage(error);
            }

            // set image source state
            panel.setSource(data);

            // initialize panel properties
            _init(props);

            // compute scaled dimensions to fit view canvas
            const dims = scaleToFit(
                props.source_dims.w,
                props.source_dims.h,
                props.base_dims.w,
                props.base_dims.h,
            );
            // store image in render layer
            imageLayer.current.load(data);
            // render image in view layer
            render(
                {x: 0, y: 0, w: dims.w, h: dims.h},
                {x: 0, y: 0, w: props.source_dims.w, h: props.source_dims.h}
            );

            panel.setStatus('loaded');
        }).catch(console.error);
    };

    /**
     * Handle image download of canvas data.
     *
     * Creates a Blob object representing the image contained in
     * the canvas; this file may be cached on the disk or stored
     * in memory at the discretion of the user agent. If type
     * is not specified, the image type is image/png. The created
     * image is in a resolution of 96 dpi.
     *
     * @private
     */

    const download = async ({ext, quality, type}) => {
        try {
            panel.setStatus('downloading');
            // create unique filename
            const ts = Date.now();
            const fname = `${panel.properties.filename || id}_${ts}.${ext}`;
            // save canvas blob as file to local disk (file-saver)
            await imageLayer.current.blob(panel.image, type, quality, (blob) => {
                if (blob) saveAs(blob, fname);
                panel.setStatus('loaded');
            });
        } catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {}
    };

    /**
     * Reset rendered image to original source image
     *
     * @private
     */

    const reset = () => {
        try {
            panel.setImage(panel.source);
            panel.pointer.resetSelectBox();
            // redraw image data to canvas
            // compute scaled dimensions to fit view canvas
            const dims = scaleToFit(
                panel.properties.source_dims.w,
                panel.properties.source_dims.h,
                panel.properties.base_dims.w,
                panel.properties.base_dims.h,
            );
            // store image in render layer
            imageLayer.current.load(panel.source);
            // render image in view layer
            render(
                {x: 0, y: 0, w: dims.w, h: dims.h},
                {x: 0, y: 0, w: panel.properties.source_dims.w, h: panel.properties.source_dims.h});
            // update panel properties
            panel.update({
                image_dims: {
                    x: 0,
                    y: 0,
                    w: panel.properties.source_dims.w,
                    h: panel.properties.source_dims.h,
                },
                render_dims: {x: 0, y: 0, w: dims.w, h: dims.h},
            });
            // set panel status
            iat.setMessage({msg: 'Loaded image reset to source image.', type: 'success'});
            panel.setStatus('loaded');
            setAligned(false);
        } catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {}
    };

    /**
     * Align images
     * - redraws right panel as target image
     *
     * @private
     */

    const align = () => {
        try {
            iat[id].setStatus('loading');
            // destructure CV image processor
            const {cv=null} = iat.cv;
            // get image data from render canvas
            // - select source/destination panel based on which panel is selected for alignment
            const panelSrc = panel.properties.id === 'panel1' ? iat.panel2 : iat.panel1;
            const panelDst = panel.properties.id === 'panel1' ? iat.panel1 : iat.panel2;
            let result = alignImages(cv, panelSrc, panelDst, imageLayer.current.canvas(), panel.image, iat.options);

            // handle errors
            if (result.error) {
                console.warn(result.error)
                return iat.setMessage(result.error);
            }

            // compute scaled dimensions to fit view canvas
            const scaledDims = scaleToFit(
                result.data.width,
                result.data.height,
                panel.properties.base_dims.w,
                panel.properties.base_dims.h
            );

            // render transformed image data to canvas
            render(
                {x: 0, y: 0, w: scaledDims.w, h: scaledDims.h},
                {x: 0, y: 0, w: result.data.width, h: result.data.height}
            );
            // render(
            //     panel.properties.render_dims,
            //     {x: 0, y: 0, w: result.width, h: result.height}
            // );
            panel.setStatus('loaded');
            setAligned(true);
        }
        catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {

        }
    }

    /**
     * Load image into panel
     *
     * @private
     */

    useEffect(()=>{
        if (panel.status === 'load') {
            load(panel.properties);
        }
        if (panel.status === 'update') {
            update();
        }
        return ()=> { panel.setStatus('loaded') }
    }, [panel.status]);

    /**
     * Apply magnifier.
     *
     * @private
     */

    React.useEffect(() => {
        if (panel.pointer.magnify) {
            _resetBounds();
            magnifierLayer.current.magnify(magnifiedLayer.current.canvas(), panel);
        }
        else {
            magnifierLayer.current.clear();
        }
    }, [panel.pointer.x, panel.pointer.y, panel.pointer.magnify]);

    /**
     * Update control point positions
     *
     * @private
     */

    useEffect(()=>{
        const pts = [];
        panel.pointer.points.forEach((ctrlPt) => {
            // scale control point to render view
            const pt = scalePoint(ctrlPt, panel.properties.render_dims, panel.properties.image_dims);
            // DEBUG
            // console.log('update control point:', ctrlPt, pt, panel.properties.render_dims, panel.properties.image_dims)
            // add scaled point to array
            pts.push(pt);
        });
        // redraw points on overlay canvas
        overlayLayer1.current.drawControlPoints(pts);
        _resetBounds();
    }, [panel.pointer.points]);

    /**
     * Overlay control points from other panel
     *
     * @private
     */

    useEffect(()=>{
        // draw overlay control points from opposite panel
        if (panel.properties.overlay) {
            const panelID = panel.properties.id === 'panel1' ? 'panel2' : 'panel1';
            const otherPanel = iat[panelID];
            const pts = [];
            otherPanel.pointer.points.forEach((ctrlPt) => {
                // scale control point to render view
                const pt = scalePoint(ctrlPt, otherPanel.properties.render_dims, otherPanel.properties.image_dims);
                // DEBUG
                // console.log('update control point:', ctrlPt, pt, panel.properties.render_dims, panel.properties.image_dims)
                // add scaled point to array
                pts.push(pt);
            });
            // redraw points on overlay canvas
            overlayLayer2.current.drawControlPoints(pts, 'cyan');
        }
        else {
            overlayLayer2.current.clear();
        }

    }, [panel.properties.overlay]);

    /**
     * Update canvas boundaries on window resize
     *
     * @private
     */

    useEffect(()=>{
        _resetBounds();
    }, [winWidth, winHeight]);

    /**
     * Update methods based on IAT mode
     *
     * @private
     */

    useEffect(()=>{
        // load panel methods of IAT mode
        if (iat.mode === 'pan')
            panel.setMethods({
                onMouseDown: panStart,
                onMouseUp: panEnd,
                onMouseMove: pan,
                onMouseOut: panEnd
            });
        else if (iat.mode === 'select') {
            if (panel.image) reset();
            panel.setMethods({
                onMouseDown: setControlPoint,
                onMouseUp: deselectControlPoint,
                onMouseMove: moveControlPoint,
                onMouseOut: deselectControlPoint
            });
        }
        else if (iat.mode === 'crop') {
            if (panel.image) reset();
            panel.setMethods({
                onMouseDown: cropStart,
                onMouseUp: cropEnd,
                onMouseMove: cropBound,
                onMouseOut: cropEnd
            });
        }
    }, [iat.mode]);

    /**
     * Render panel canvases
     */

    return <div className={'panel'}>
        <PanelMenu
            id={id}
            methods={{
                load,
                saveAs: download,
                saveState: save,
                redraw: render,
                clear,
                fit,
                expand,
                resize,
                zoomOut,
                zoomIn,
                reset,
                remove
            }}
        />
        <PanelInfo panel={panel} />
        {
            panel.status === 'error' &&
            <UserMessage message={{ msg: 'An error has occurred!', type: 'error' }} />
        }
        <div className={'canvas-layers'}>
            <LoadButton id={id} loader={load} />
            <Canvas
                ref={controlLayer}
                id={`${id}_control_layer`}
                className={`layer canvas-layer-control-${iat.mode} ${panel.pointer.magnify ? 'magnify' : ''}`}
                width={panel.properties.base_dims.w}
                height={panel.properties.base_dims.h}
                onMouseUp={controller.onMouseUp}
                onMouseDown={controller.onMouseDown}
                onMouseMove={controller.onMouseMove}
                onMouseOut={controller.onMouseOut}
                onKeyDown={controller.onKeyDown}
                onKeyUp={controller.onKeyUp}
            />
            <MagnifierTool
                ref={magnifierLayer}
                id={`${id}_magnifier_layer`}
                className={`layer canvas-layer-magnifier`}
                width={panel.properties.base_dims.w}
                height={panel.properties.base_dims.h}
            />
            <Overlay
                ref={overlayLayer1}
                key={`${id}_overlay_layer-1`}
                id={`${id}_overlay_layer-1`}
                className={`layer canvas-layer-overlay`}
                width={panel.properties.base_dims.w}
                height={panel.properties.base_dims.h}
            />
            <Overlay
                ref={overlayLayer2}
                key={`${id}_overlay_layer-2`}
                id={`${id}_overlay_layer-2`}
                className={`layer canvas-layer-overlay`}
                width={panel.properties.base_dims.w}
                height={panel.properties.base_dims.h}
            />
            <Canvas
                ref={viewLayer}
                id={`${id}_view_layer`}
                className={`layer canvas-layer-view`}
                width={panel.properties.base_dims.w}
                height={panel.properties.base_dims.h}
            />
            <Canvas
                ref={magnifiedLayer}
                id={`${id}_magnified_layer`}
                className={`layer canvas-layer-render hidden`}
                width={iat.options.maxMagnifiedWidth}
                height={iat.options.maxMagnifiedHeight}
            />
            <Canvas
                ref={imageLayer}
                id={`${id}_render_layer`}
                className={`layer canvas-layer-render hidden`}
                width={iat.options.maxImageWidth}
                height={iat.options.maxImageHeight}
            />
            <Grid
                ref={gridLayer}
                id={`${id}_base_layer`}
                style={{ backgroundImage: `url(${baseGrid})` }}
                className={`canvas-layer-base`}
                width={panel.properties.base_dims.w}
                height={panel.properties.base_dims.h}
            />
            {
                iat.mode === 'select' &&
                <Register id={id} callback={align} aligned={aligned} />
            }
            {
                iat.mode === 'crop' && panel.image && panel.status === 'loaded' &&
                <CropTool id={id} callback={crop} update={cropAdjust} />
            }
        </div>
    </div>;
};

export default memo(PanelToolkit);
