/*!
 * MLE.Client.Components.Common.Slider
 * File: slider.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Sliding view of overlapping images
 *
 * ---------
 * Revisions
 * - 14-07-2023   Redo of slider canvases.
 */

import React, {useLayoutEffect, useRef, useState} from 'react';
import { schema } from '../../schema';
import Loading from './loading';
import { UserMessage } from './message';
import {scaleToFit} from '../toolkit/tools/scaler.toolkit';
import InputSelector from "../selectors/input.selector";
import Canvas from "../toolkit/canvas/default.canvas.toolkit";
import styles from '../styles/slider.module.css';
import {useWindowSize} from "../../_utils/events.utils.client";

/**
 * Image slider component.
 *
 * @public
 * @return
 */

const Slider = ({ images = [], canvasWidth = 600, canvasHeight = 500 }) => {

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // input image data
    const [image1, image2] = images || [];

    // mounted status
    const _isMounted = React.useRef(false);

    // image data layers
    const renderLayer1 = useRef(null);
    const renderLayer2 = useRef(null);
    const imageLayer1 = useRef(null);
    const imageLayer2 = useRef(null);
    const controlLayer = useRef();

    // create reference to panel resizer
    let sliding = false;
    let slideWidth = 0;
    let slideInit = 0;

    const [status1, setStatus1] = React.useState('empty');
    const [status2, setStatus2] = React.useState('empty');
    const [message, setMessage] = React.useState('empty');

    const [viewWidth, setViewWidth] = React.useState(0);
    const [viewDims, setViewDims] = React.useState(null);

    // Image labels
    const label1 = image1 && image1.hasOwnProperty('label') ? image1.label : 'Image 1';
    const label2 = image2 && image2.hasOwnProperty('label') ? image2.label : 'Image 2';

    // top layer opacity state
    const [opacity, setOpacity] = useState(100);


    /**
     * Load image data in comparator panel
     *
     * @private
     */

    const load = () => {

        // status = image loading has started
        setStatus1('loading');
        setStatus2('loading');

        // set data urls for images
        const url1 = image1 && image1.hasOwnProperty('url') ? image1.url.medium : image1;
        const url2 = image2 && image2.hasOwnProperty('url') ? image2.url.medium : image2;
        // set image sources
        imageLayer1.current.src = url1;
        imageLayer2.current.src = url2;

        // load image 1 (overlay)
        imageLayer1.current.onerror = () => {
            setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
            imageLayer1.current.src = schema.errors.image.fallbackSrc;
        };
        imageLayer1.current.onload = function() {

            // compute scaled dimensions to fit view canvas
            const viewDims1 = scaleToFit(imageLayer1.current.width, imageLayer1.current.height, canvasWidth, canvasHeight);

            // load data into canvas layer
            // - initially show half of top layer image
            const initWidth = viewDims1.w / 2;
            renderLayer1.current.draw(imageLayer1.current, {
                view: {x: 0, y: 0, w: viewDims1.w / 2, h: viewDims1.h},
                source: {x: 0, y: 0, w: imageLayer1.current.width / 2, h: imageLayer1.current.height}
            });

            // set initial view dims
            setViewWidth(initWidth);
            setViewDims(viewDims1);

            // update load status
            setStatus1('loaded');

        };

        // load image 2 (underlay)
        imageLayer2.current.onerror = () => {
            setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
            imageLayer2.current.src = schema.errors.image.fallbackSrc;
        };
        imageLayer2.current.onload = function() {
            // compute scaled dimensions to fit view canvas
            const viewDims2 = scaleToFit(
                imageLayer2.current.width,
                imageLayer2.current.height,
                canvasWidth,
                canvasHeight,
            );

            // load data into canvas layer
            renderLayer2.current.draw(imageLayer2.current, {
                view: {x: 0, y: 0, w: viewDims2.w, h: viewDims2.h},
                source: {x: 0, y: 0, w: imageLayer2.current.width, h: imageLayer2.current.height}
            });
        };

        setStatus2('loaded');
    }

    /**
     * change top layer opacity
     *
     * @private
     */

    const _updateOpacity = (e) => {
        const { target = {} } = e || {};
        const { value = 100 } = target;
        setOpacity(value);
        // set canvas layer alpha value for opacity
        renderLayer1.current.alpha( value / 100 );
    }

    /**
     * Load comparator images
     * - comparison of images in same scale
     * - use the largest dimension to set the scale
     *
     * @private
     */

    useLayoutEffect(()=>{
        if (status1 === 'empty' || status2 === 'empty') {
            load();
        }
        return ()=>{_isMounted.current = true;}

    }, []);

    useLayoutEffect(()=>{
        load();
        return ()=>{_isMounted.current = true;}

    }, [winWidth, winHeight]);

    /* Initialize panel resize */
    function _resizeStart(e) {
        /* if slider is no longer engaged, exit this function: */
        if (sliding) return false;
        sliding = true;
        slideInit = e.pageX;
        slideWidth = viewWidth;
    }

    /* Position the slider and resize panel */
    function _resizeEnd() {
        /* if slider is no longer engaged, exit this function: */
        if (!sliding) return false;
        sliding = false;
        setViewWidth(slideWidth);
    }

    /* Position the slider and resize panel */
    function _resize(e) {

        /* if slider is no longer engaged, exit this function: */
        if (!sliding) return false;

        // compute adjusted widths
        const _viewWidth = viewWidth - Math.round(slideInit - e.pageX);
        const _imageWidth = Math.round(_viewWidth * ( imageLayer1.current.width / viewDims.w));

        // load data into canvas layer
        // - initially show half of top layer image
        renderLayer1.current.draw(imageLayer1.current, {
            view: {x: 0, y: 0, w: _viewWidth, h: viewDims.h},
            source: {x: 0, y: 0, w: _imageWidth, h: imageLayer1.current.height}
        });

        // set slide width
        slideWidth = _viewWidth;

    }

    return <>
        <div className={styles.slider}>
            { ( status1 !== 'loaded' || status2 !== 'loaded' ) && <Loading className={'centered'} overlay={false}/> }
            { message && <UserMessage message={message} /> }
            <div className={styles.container} style={{height: canvasHeight, width: canvasWidth, margin: 'auto'}}>
                <Canvas
                    ref={controlLayer}
                    id={`slider_image_control`}
                    className={styles.overlay}
                    width={canvasWidth}
                    height={canvasHeight}
                    onMouseDown={_resizeStart}
                    onTouchStart={_resizeStart}
                    onMouseUp={_resizeEnd}
                    onMouseMove={_resize}
                    onTouchEnd={_resizeEnd}
                    onTouchMove={_resize}
                />
                <Canvas
                    className={styles.image1}
                    ref={renderLayer1}
                    id={`slider_image_layer_1`}
                    width={canvasWidth}
                    height={canvasHeight}
                />
                <Canvas
                    className={styles.image2}
                    ref={renderLayer2}
                    id={`slider_image_layer_2`}
                    width={canvasWidth}
                    height={canvasHeight}
                />
                <img
                    style={{ 'display': 'none' }}
                    ref={imageLayer1}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label1}
                />
                <img
                    style={{ 'display': 'none' }}
                    ref={imageLayer2}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label2}
                />
            </div>
            <InputSelector
                style={{width: '200px'}}
                id={'layer_opacity'}
                name={'layer_opacity'}
                label={`Opacity ${opacity}%`}
                type={'range'}
                value={opacity}
                min={0}
                max={100}
                onChange={_updateOpacity}
            />
        </div>
    </>;

};

export default Slider;