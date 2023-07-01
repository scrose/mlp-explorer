/*!
 * MLP.Client.Components.IAT.Panel
 * File: panel.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {memo, useEffect, useRef} from 'react';
import saveAs from 'file-saver';
import PanelMenu from './panel.menu.iat';
import PanelInfo from './panel.info.iat';
import ControlPoints from '../controls/control-points.iat';
import Magnifier from '../canvas/magnifier.iat';
import baseGrid from '../../svg/grid.svg';
import Cropper from '../controls/cropper.iat';
import {useIat} from "../../../_providers/iat.provider.client";
import Canvas from "../canvas/canvas.iat";
import {cropImage, getScale, inRange, scalePoint, scaleToFit} from "../controls/transform.iat";
import {loadImage} from "../loaders/image.loader.iat";
import LoadButton from "../loaders/load.button.iat";
import {useController} from "./panel.controller.iat";
import Grid from "../canvas/grid.iat";
import {UserMessage} from "../../common/message";
import Overlay from "../canvas/overlay.iat";
import {getError} from "../../../_services/schema.services.client";
import {getPos} from "../controls/pointer.iat";
import {alignImages} from "../controls/aligner.iat";
import {useWindowSize} from "../../../_utils/events.utils.client";

/**
 * IAT panel component.
 *
 * NOTES:
 * Reference: Some features adapted from Image Analysis Toolkit (IAT), Mike Whitney
 *
 * @param id
 * @public
 */

const PanelIat = ({id = null}) => {

    const iat = useIat();
    const panel = iat[id];
    const controller = useController(id);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

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
            bounds: {
                top: bounds.top,
                left: bounds.left,
                w: bounds.width,
                h: bounds.height,
            }
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
        panel.update({
            bounds: {
                top: bounds.top,
                left: bounds.left,
                w: bounds.width,
                h: bounds.height,
            }
        });
        return bounds;
    }


    /**
     * Update magnified image after new render
     *
     * @private
     */

    const _updateMagnifier = (imageDims) => {
        // compute scaled image dimensions of full magnified image
        const magDims = scaleToFit(
            imageDims ? imageDims.w : panel.properties.image_dims.w,
            imageDims ? imageDims.h : panel.properties.image_dims.h,
            iat.options.maxMagnifiedWidth,
            iat.options.maxMagnifiedHeight,
        );
        // DEBUG
        // console.log(id, imageDims.w, imageDims.h, iat.options.maxMagnifiedWidth, iat.options.maxMagnifiedHeight, magDims)

        // store scaled image in magnified layer
        magnifiedLayer.current.draw(imageLayer.current.canvas(), {view: {x: 0, y: 0, w: magDims.w, h: magDims.h}, source: imageDims});
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
            _updateMagnifier(imageDims);
            // update panel properties
            panel.update({render_dims: viewDims});

        } catch (err) {
            console.error(err);
            panel.setStatus('error');
        } finally {}
    };

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
     * convenience method for resizing dimensions of image
     * */

    const resize = ({base_dims, render_dims, image_dims}) => {
        clear();

        // scale image
        // destructure CV image processor
        const {cv=null} = iat.cv;

        // create src/dst image matrices
        let src = cv.imread(imageLayer.current.canvas())
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
            }
        });

        src.delete(); dst.delete();
    }

    /**
     * Crop image by pointer selected dimensions.
     * - sets image source data to the (x,y) offset and (w,h) dimensions
     *   of the selected crop box to draw to the render canvas.
     */

    const crop = () => {

        iat[id].setStatus('loading');
        // destructure CV image processor
        const {cv=null} = iat.cv;
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

        // update image crop dimensions
        panel.update({
                source_dims: panel.pointer.selectBox,
                image_dims: {
                    w: panel.pointer.selectBox.w,
                    h: panel.pointer.selectBox.h,
                },
                render_dims: {
                    w: panel.pointer.selectBox.w,
                    h: panel.pointer.selectBox.h,
                    x: 0, y: 0
                }
        });

        // reset selection box
        panel.pointer.setSelectBox({ x: 0, y: 0, w: 0, h: 0 });

        iat[id].setStatus('loaded');
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
     * Start image crop bounding box.
     *
     * @public
     * @param e
     * @param properties
     * @param pointer
     */

    const cropStart = (e, properties, pointer) => {
        const scaledPt = scalePoint(pointer, properties.image_dims, properties.render_dims);
        pointer.setSelectBox({
            x: scaledPt.x,
            y: scaledPt.y,
            w: 0,
            h: 0,
        });
        // start crop box boundary
        overlayLayer1.current.drawBoundingBox(0, 0, 0, 0)
    }

    /**
     * convenience method for ending crop box
     * */

    const cropEnd = (e, properties, pointer) => {
        // reset pointer select box if dimensonless
        if (pointer.selectBox.w === 0 || pointer.selectBox.h === 0) pointer.resetSelectBox();
        // reset pointe select box if no image in panel
        console.log(!panel.image || panel.status !== 'loaded')
        if (!panel.image || panel.status !== 'loaded') {
            clear();
            pointer.resetSelectBox();
        }
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
        const _w = properties.render_dims.x + pointer.x - pointer.selected.x;
        const _h = properties.render_dims.y + pointer.y - pointer.selected.y;

        // update the pointer select box
        pointer.setSelectBox({
            x: pointer.selectBox.x,
            y: pointer.selectBox.y,
            w: Math.round(scale.x * _w),
            h: Math.round(scale.y * _h),
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
            bounds: {
                top: bounds.top,
                left: bounds.left,
                w: bounds.width,
                h: bounds.height,
            }
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
            // console.log('Draw controls:', pts, controlPoints, pos, actual, panel.properties.render_dims, panel.properties.image_dims, bounds)
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
            const {data = null, props = null} = response || {};

            if (!data) {
                panel.setStatus('empty');
                return;
            }

            // set image source state
            panel.setSource(data);

            // initialize panel properties
            _init(props);

            // compute scaled dimensions to fit view canvas
            const dims = scaleToFit(
                props.original_dims.w,
                props.original_dims.h,
                props.base_dims.w,
                props.base_dims.h,
            );
            // store image in render layer
            imageLayer.current.load(data);
            // render image in view layer
            render(
                {x: 0, y: 0, w: dims.w, h: dims.h},
                {x: 0, y: 0, w: props.original_dims.w, h: props.original_dims.h}
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
            await imageLayer.current.blob(panel.image, (blob) => {
                if (blob) saveAs(blob, fname);
                panel.setStatus('loaded');
            }, type, quality);
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
                panel.properties.original_dims.w,
                panel.properties.original_dims.h,
                panel.properties.base_dims.w,
                panel.properties.base_dims.h,
            );
            // store image in render layer
            imageLayer.current.load(panel.source);
            // render image in view layer
            render(
                {x: 0, y: 0, w: dims.w, h: dims.h},
                {x: 0, y: 0, w: panel.properties.original_dims.w, h: panel.properties.original_dims.h});
            // update panel properties
            panel.update({
                image_dims: {
                    x: 0,
                    y: 0,
                    w: panel.properties.original_dims.w,
                    h: panel.properties.original_dims.h,
                },
                render_dims: {x: 0, y: 0, w: dims.w, h: dims.h},
            });
            // set panel status
            panel.setStatus('loaded');
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
            let result = alignImages(cv, panelSrc, panelDst, panel.image, iat.options);
            // cropImage(panel2, setPanel2);
            // handle errors
            if (result.error) {
                console.warn(result.error)
                return iat.setMessage(result.error);
            }
            // load transformed data into destination panel
            panel.setImage(result.data);
            imageLayer.current.putImageData(result.data);
            // render transformed image data to canvas
            render(
                panel.properties.render_dims,
                {x: 0, y: 0, w: result.width, h: result.height}
            );
            panel.setStatus('loaded');
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
        if (iat.mode === 'default')
            panel.setMethods({
                onMouseDown: ()=>{},
                onMouseMove: ()=>{},
                onMouseUp: ()=>{},
                onMouseOut: ()=>{}
            });
        else if (iat.mode === 'select')
            panel.setMethods({
                onMouseDown: setControlPoint,
                onMouseUp: deselectControlPoint,
                onMouseMove: moveControlPoint,
                onMouseOut: deselectControlPoint
            });
        else if (iat.mode === 'crop')
            panel.setMethods({
                onMouseDown: cropStart,
                onMouseUp: cropEnd,
                onMouseMove: cropBound,
                onMouseOut: cropEnd
            });
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
                redraw: render,
                clear,
                fit,
                expand,
                resize,
                zoomOut,
                zoomIn,
                reset,
                align
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
            <Magnifier
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
                <ControlPoints id={id} />
            }
            {
                iat.mode === 'crop' && panel.image && panel.status === 'loaded' &&
                <Cropper id={id} callback={crop} update={cropAdjust} />
            }
        </div>
    </div>;
};

export default memo(PanelIat);
