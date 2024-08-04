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
 * - 03-08-2024   Update slider to include image swap controls; centred view.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { schema } from '../../schema';
import Loading from './loading';
import { UserMessage } from './message';
import { scaleToFit } from '../alignment/tools/scaler.alignment';
import InputSelector from "../selectors/input.selector";
import Button from './button';
import Canvas from "../alignment/canvas/default.canvas.alignment";
import styles from '../styles/slider.module.css';
import { useWindowSize } from "../../_utils/events.utils.client";

/**
 * Image slider component.
 *
 * @public
 * @return
 */

const Slider = ({ images = [], toggle=false }) => {

    // default canvas sizes
    const DEFAULT_CANVAS_WIDTH = 900;
    const DEFAULT_CANVAS_HEIGHT = 900;

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // input image data
    const [image1, image2] = images || [];

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

    const [canvasWidth, setCanvasWidth] = React.useState(DEFAULT_CANVAS_WIDTH);
    const [canvasHeight, setCanvasHeight] = React.useState(DEFAULT_CANVAS_HEIGHT);

    const [status1, setStatus1] = React.useState('empty');
    const [status2, setStatus2] = React.useState('empty');
    const [message, setMessage] = React.useState('empty');

    const [viewWidth, setViewWidth] = React.useState(0);
    const [viewDims, setViewDims] = React.useState(null);
    const [viewSlider, setViewSlider] = React.useState(toggle);

    // Image labels
    const label1 = image1 && image1.hasOwnProperty('label') ? image1.label : 'Image 1';
    const label2 = image2 && image2.hasOwnProperty('label') ? image2.label : 'Image 2';

    // top layer opacity state
    const [opacity, setOpacity] = useState(100);


    /**
     * Render image 1 data on canvas layer 1
     *
     * @private
     */

    const _drawImage1 = () => {

        if (!imageLayer1.current) return;

        // compute scaled dimensions for image 1 to fit view canvas
        const viewDims1 = scaleToFit(
            imageLayer1.current.width,
            imageLayer1.current.height,
            canvasWidth,
            canvasHeight,
        );

        // compute image x offset
        const viewOffset1 = (canvasWidth - viewDims1.w) / 2;

        // render image to canvas
        renderLayer1.current.draw(imageLayer1.current, {
            view: { x: viewOffset1, y: 0, w: viewSlider && toggle ? viewDims1.w / 2 : viewDims1.w, h: viewDims1.h },
            source: { x: 0, y: 0, w: viewSlider && toggle ? imageLayer1.current.width / 2 : imageLayer1.current.width, h: imageLayer1.current.height }
        });

        // set initial view dims
        if (toggle) {
            setCanvasWidth(viewDims1.w);
            setCanvasHeight(viewDims1.h);
            setViewWidth(viewSlider ? viewDims1.w / 2 : viewDims1.w);
            setViewDims(viewDims1);
        }
    }

    /**
     * Render image 2 data on canvas layer 2
     *
     * @private
     */

    const _drawImage2 = () => {

        if (!imageLayer2.current) return;

        // compute scaled dimensions for image 2 to fit view canvas
        const viewDims2 = scaleToFit(
            imageLayer2.current.width,
            imageLayer2.current.height,
            canvasWidth,
            canvasHeight,
        );

        // compute image x offset
        const viewOffset2 = (canvasWidth - viewDims2.w) / 2;

        // render image to canvas (toggle sets layer 1 as top layer)
        renderLayer2.current.draw(imageLayer2.current, {
            view: { x: viewOffset2, y: 0, w: viewSlider && !toggle ? viewDims2.w / 2 : viewDims2.w, h: viewDims2.h },
            source: { x: 0, y: 0, w: viewSlider && !toggle ? imageLayer2.current.width / 2 : imageLayer2.current.width, h: imageLayer2.current.height }
        });

        // set initial view dims
        if (!toggle) {
            setCanvasWidth(viewDims2.w);
            setCanvasHeight(viewDims2.h);
            setViewWidth(viewSlider ? viewDims2.w / 2 : viewDims2.w);
            setViewDims(viewDims2);
        }
    }


    /**
     * Load image data in comparator panel
     *
     * @private
     */

    const _load = () => {

        // status = image loading has started
        setStatus1('loading');
        setStatus2('loading');

        // set data urls for images
        const url1 = image1 && image1.hasOwnProperty('url') ? image1.url.medium : image1;
        const url2 = image2 && image2.hasOwnProperty('url') ? image2.url.medium : image2;
        // set image sources
        imageLayer1.current.src = url1;
        imageLayer2.current.src = url2;

        // load image 1
        imageLayer1.current.onload = function () {
            // load image data to canvas layer
            _drawImage1();
            // update load status
            setStatus1('loaded');
        };
        imageLayer1.current.onerror = () => {
            setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
            imageLayer1.current.src = schema.errors.image.fallbackSrc;
        };

        // load image 2
        imageLayer2.current.onload = function () {
            // load image data to canvas layer
            _drawImage2();
            // update load status
            setStatus2('loaded');
        };
        imageLayer2.current.onerror = () => {
            setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
            imageLayer2.current.src = schema.errors.image.fallbackSrc;
        };
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
        toggle ? renderLayer1.current.alpha(value / 100) : renderLayer2.current.alpha(value / 100);
    }

    /**
     * reset opacity on both layers
     *
     * @private
     */

    const _resetOpacity = () => {
        setOpacity(100);
        renderLayer1.current.alpha(100);
        renderLayer2.current.alpha(100);
    }

    /**
     * Load comparator images
     * - comparison of images in same scale
     * - use the largest dimension to set the scale
     *
     * @private
     */

    useLayoutEffect(() => {
        if (status1 === 'empty' || status2 === 'empty') {
            _load();
        }
    }, []);

    useLayoutEffect(() => {
        _load();
    }, [winWidth, winHeight]);

    useEffect(() => {
        setViewSlider(false);
    }, [toggle]);

    useLayoutEffect(() => {
        _drawImage1();
        _drawImage2();
        _resetOpacity();
    }, [viewSlider]);

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
        const _imageFullWidth = toggle ? imageLayer1.current.width : imageLayer2.current.width;
        const _imageWidth = Math.round(_viewWidth * (_imageFullWidth / viewDims.w));
        const _viewOffset = (canvasWidth - viewDims.w) / 2;

        // load data into canvas layer
        // - initially show half of top layer image
        toggle ? 
        renderLayer1.current.draw(imageLayer1.current, {
            view: { x: _viewOffset, y: 0, w: _viewWidth, h: viewDims.h },
            source: { x: 0, y: 0, w: _imageWidth, h: imageLayer1.current.height }
        }) 
        :
        renderLayer2.current.draw(imageLayer2.current, {
            view: { x: _viewOffset, y: 0, w: _viewWidth, h: viewDims.h },
            source: { x: 0, y: 0, w: _imageWidth, h: imageLayer2.current.height }
        });

        // set slide width
        slideWidth = _viewWidth;

    }

    return <>
        <div className={styles.slider}>
            {(status1 !== 'loaded' || status2 !== 'loaded') && <Loading className={'centered'} overlay={true} />}
            {message && <UserMessage message={message} />}
            <div className={styles.container} style={{ height: `${canvasHeight}px`, width: `${canvasWidth}px`, margin: 'auto' }}>
                <Canvas
                    ref={controlLayer}
                    id={`slider_image_control`}
                    style={{'zIndex': viewSlider ? 30 : 0}}
                    className={styles.overlay}
                    width={DEFAULT_CANVAS_WIDTH}
                    height={DEFAULT_CANVAS_HEIGHT}
                    onMouseDown={_resizeStart}
                    onTouchStart={_resizeStart}
                    onMouseUp={_resizeEnd}
                    onMouseMove={_resize}
                    onTouchEnd={_resizeEnd}
                    onTouchMove={_resize}
                />
                <Canvas
                    style={{'zIndex': toggle ? 20 : 10}}
                    className={styles.image1}
                    ref={renderLayer1}
                    id={`slider_image_layer_1`}
                    width={DEFAULT_CANVAS_WIDTH}
                    height={DEFAULT_CANVAS_HEIGHT}
                />
                <Canvas
                    style={{'zIndex': toggle ? 10 : 20}}
                    className={styles.image2}
                    ref={renderLayer2}
                    id={`slider_image_layer_2`}
                    width={DEFAULT_CANVAS_WIDTH}
                    height={DEFAULT_CANVAS_HEIGHT}
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
            <div className={'slide-menu h-menu vcentered'}>
                <ul>
                    <li><Button
                        title={'Compare Images using Slider'}
                        label={viewSlider ? 'Slider On' : 'Slider Off'}
                        className={`capture-button ${viewSlider && 'active'}`}
                        icon={'slider'}
                        onClick={() => {setViewSlider(!viewSlider)}}
                    /></li>
                    <li className={'push'}>
                        <InputSelector
                            style={{ width: '200px' }}
                            id={'layer_opacity'}
                            name={'layer_opacity'}
                            label={`Opacity ${opacity}%`}
                            type={'range'}
                            value={opacity}
                            min={0}
                            max={100}
                            onChange={_updateOpacity} />
                    </li>
                </ul>
            </div>

        </div>
    </>;

};

export default Slider;