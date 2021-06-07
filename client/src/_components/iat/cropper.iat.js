/*!
 * MLP.Client.Components.IAT.Cropper
 * File: cropper.points.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { drawBoundingBox } from './graphics.iat';
import Input from '../common/input';
import Button from '../common/button';
import { getScale, scalePoint } from './transform.iat';

/**
 * Creates cropper control panel component.
 *
 * @param properties
 * @param pointer
 * @param canvas
 * @param callback
 * @return
 */

const Cropper = ({ properties, pointer, callback }) => {

    // render dimensions
    const _imgW = properties.image_dims.w;
    const _imgH = properties.image_dims.h;

    // get current select box dimensions
    let _w = pointer.selectBox.w;
    let _h = pointer.selectBox.h;
    let _x = pointer.selectBox.x;
    let _y = pointer.selectBox.y;
    let updatedSelectBox = { x: _x, y: _y, w: _w, h: _h };

    // Handle dimensional changes
    const _handleChange = (e) => {
        e.preventDefault();

        const { target = {} } = e || {};
        const { name = '', value = '' } = target;
        const delta = parseInt(value);

        // update crop dimensions
        const crops = {
            x: () => {
                updatedSelectBox.x = Math.min(delta, _imgW);
            },
            y: () => {
                updatedSelectBox.y = Math.min(delta, _imgH);
            },
            w: () => {
                updatedSelectBox.w = Math.min(delta, _imgW);
            },
            h: () => {
                updatedSelectBox.h = Math.min(delta, _imgH);
            }
        }
        crops[name]();

        // Scale select box dimensions for canvas rendering
        const scaled = scaleSelectBox(updatedSelectBox, properties);

        // update pointer state and draw crop box to canvas
        pointer.setSelectBox(updatedSelectBox);
        callback({
            draw: drawBoundingBox.bind(this, scaled.x, scaled.y, scaled.w, scaled.h),
            status: 'draw',
            props: {}
        });
    };

    // is the crop box empty?
    const isEmptyCropBox = pointer.selectBox.w === 0 && pointer.selectBox.h === 0;

    return <div className={'canvas-view-controls'}>
        <fieldset className={'super_compact'}>
            <div className={'h-menu centered'}>
                <ul>
                    <li>
                        <Button
                            disabled={isEmptyCropBox}
                            icon={'crop'}
                            label={`Crop`}
                            onClick={() => {
                                crop(pointer, properties, callback)
                            }}
                        />
                    </li>
                    <li>
                        <Input
                            disabled={isEmptyCropBox}
                            id={'crop_x'}
                            name={'x'}
                            label={'X'}
                            type={'int'}
                            value={updatedSelectBox.x}
                            min={0}
                            max={properties.image_dims.w}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Input
                            id={'crop_y'}
                            disabled={isEmptyCropBox}
                            name={'y'}
                            label={'Y'}
                            type={'int'}
                            min={0}
                            max={properties.image_dims.h}
                            value={updatedSelectBox.y}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Input
                            id={'crop_w'}
                            disabled={isEmptyCropBox}
                            name={'w'}
                            label={'W'}
                            type={'int'}
                            min={0}
                            max={properties.image_dims.w}
                            value={updatedSelectBox.w}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Input
                            id={'crop_h'}
                            disabled={isEmptyCropBox}
                            name={'h'}
                            label={'H'}
                            type={'int'}
                            min={0}
                            max={properties.image_dims.h}
                            value={updatedSelectBox.h}
                            onChange={_handleChange}
                        />
                    </li>
                </ul>
            </div>
        </fieldset>
        </div>
}

export default Cropper;

/**
 * Start image crop bounding box.
 *
 * @public
 * @param e
 * @param properties
 * @param options
 * @param pointer
 * @param callback
 */

export function cropStart(e, properties, pointer, options, callback) {
    const scaledPt = scalePoint(pointer, properties);
    pointer.setSelectBox({
        x: scaledPt.x,
        y: scaledPt.y,
        w: 0,
        h: 0,
    });
    // update image offset coordinate
    callback({
        status: 'draw', props: {},
        draw: drawBoundingBox.bind(this, 0, 0, 0, 0),
    });
}

/**
 * Crop image by pointer selected dimensions.
 * - sets image source data to the (x,y) offset and (w,h) dimensions
 *   of the selected crop box to draw to the render canvas.
 * @param pointer
 * @param properties
 * @param callback
 */

export function crop(pointer, properties, callback) {

    // check that mouse start position was selected
    if (!pointer.selectBox) return;

    // is the crop box empty? If so, return.
    if (pointer.selectBox.w === 0 && pointer.selectBox.h === 0) return;

    // update image crop dimensions and rerender
    callback({
        status: 'render',
        props: {
            source_dims: pointer.selectBox,
            image_dims: {
                w: pointer.selectBox.w,
                h: pointer.selectBox.h,
            },
            render_dims: {
                w: pointer.selectBox.w,
                h: pointer.selectBox.h,
                x: 0, y: 0
            }
        },
    });

    // reset selection box
    pointer.setSelectBox({ x: 0, y: 0, w: 0, h: 0 });
}

/**
 * Mouse up on crop bounding box.
 *
 * @public
 * @param e
 * @param properties
 * @param options
 * @param pointer
 */

export function cropEnd(e, properties, pointer, options) {}

/**
 * Update canvas offset by cursor position
 * @param e
 * @param properties
 * @param pointer
 * @param options
 * @param callback
 */

export function cropBound(e, properties, pointer, options, callback) {

    // check that mouse start position was selected
    if (!pointer.selected) return;

    e.preventDefault();

    // compute select box dimensions
    const scale = getScale(properties);
    const _w = properties.render_dims.x + pointer.x - pointer.selected.x;
    const _h = properties.render_dims.y + pointer.y - pointer.selected.y;

    // update the pointer select box
    pointer.setSelectBox({
        x: pointer.selectBox.x,
        y: pointer.selectBox.y,
        w: Math.round(scale.x * _w),
        h: Math.round(scale.y * _h),
    });

    // update image offset coordinate
    callback({
        status: 'draw', props: {},
        draw: drawBoundingBox.bind(
            this, pointer.selected.x, pointer.selected.y, _w, _h),
    });
}

/**
 * Scale selection by current render dimensions.
 * @param selectBox
 * @param properties
 */

const scaleSelectBox = (selectBox, properties) => {

    // get current render scale
    let scale = getScale(properties);

    // compute scaled dimensions / coordinates
    const scaledSelectBox =
        {
            x: Math.round(selectBox.x * 1/scale.x),
            y: Math.round(selectBox.y * 1/scale.y),
            w: Math.round(selectBox.w * 1/scale.x),
            h: Math.round(selectBox.h * 1/scale.y)
        };

    // adjust for negative select box dimensions
    if (scaledSelectBox.w < 0 ) {
        scaledSelectBox.w = Math.abs(scaledSelectBox.w);
        scaledSelectBox.x = scaledSelectBox.x - scaledSelectBox.w;
    }
    if (scaledSelectBox.h < 0 ) {
        scaledSelectBox.h = Math.abs(scaledSelectBox.h);
        scaledSelectBox.y = scaledSelectBox.y - scaledSelectBox.h;
    }

    return scaledSelectBox;
}
