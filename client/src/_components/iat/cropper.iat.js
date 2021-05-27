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

    // canvas dimensions
    const _W = properties.base_dims.w;
    const _H = properties.base_dims.h;

    // render dimensions
    const _imgW = properties.source_dims.w;
    const _imgH = properties.source_dims.h;

    // scale selection box by render dimensions
    const updatedDims = scaleSelectBox(pointer, properties);

    // compute crop dimensions
    const _top = updatedDims.y;
    const _bottom = _imgH - updatedDims.h - updatedDims.y;
    const _left = updatedDims.x;
    const _right = _imgW - updatedDims.w - updatedDims.x;

    // Handle dimensional changes
    const _handleChange = (e) => {
        const { target = {} } = e || {};
        const { name = '', value = '' } = target;

        const updatedDims = scaleSelectBox(pointer, properties);
        let _w = updatedDims.w;
        let _h = updatedDims.h;
        let _x = updatedDims.x;
        let _y = updatedDims.y;

        // update crop dimensions
        const crops = {
            l: () => {
                _w -= (parseInt(value) - _x);
                _x = parseInt(value);
            },
            r: () => {
                _w = ( _W -  parseInt(value) - _x);
            },
            t: () => {
                _h -= ( parseInt(value) - _y );
                _y = parseInt(value);
            },
            b: () => {
                _h = ( _H - _y - parseInt(value));
            }
        }
        crops[name]();

        // update pointer state and draw crop box to canvas
        pointer.setSelectBox({ x: _x, y: _y, w: _w, h: _h });
        callback({
            draw: drawBoundingBox.bind(this, _x, _y, _w, _h),
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
                            label={`Crop [${Math.abs(updatedDims.w)}, ${Math.abs(updatedDims.h)}]`}
                            onClick={() => {
                                crop(pointer, properties, callback)
                            }}
                        />
                    </li>
                    <li>
                        <Input
                            disabled={isEmptyCropBox}
                            id={'crop_top'}
                            name={'t'}
                            label={'T'}
                            type={'int'}
                            value={_top}
                            min={0}
                            max={properties.base_dims.h}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Input
                            id={'crop_bottom'}
                            disabled={isEmptyCropBox}
                            name={'b'}
                            label={'B'}
                            type={'int'}
                            min={0}
                            max={properties.base_dims.h}
                            value={_bottom}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Input
                            id={'crop_left'}
                            disabled={isEmptyCropBox}
                            name={'l'}
                            label={'L'}
                            type={'int'}
                            min={0}
                            max={properties.base_dims.w}
                            value={_left}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Input
                            id={'crop_right'}
                            disabled={isEmptyCropBox}
                            name={'r'}
                            label={'R'}
                            type={'int'}
                            min={0}
                            max={properties.base_dims.w}
                            value={_right}
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
    pointer.setSelectBox({
        x: pointer.x,
        y: pointer.y,
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

    // scale selection box by render dimensions
    const updatedDims = scaleSelectBox(pointer, properties);

    // update image crop dimensions and rerender
    callback({
        status: 'render',
        props: {
            source_dims: updatedDims,
            image_dims: {
                w: updatedDims.w,
                h: updatedDims.h,
            },
            render_dims: {
                w: updatedDims.w,
                h: updatedDims.h,
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

export function cropEnd(e, properties, pointer, options) {
}

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

    // compute distance traveled
    const _deltaX = properties.render_dims.x + pointer.x - pointer.selected.x;
    const _deltaY = properties.render_dims.y + pointer.y - pointer.selected.y;

    // update the pointer select box
    pointer.setSelectBox({
        x: pointer.selectBox.x,
        y: pointer.selectBox.y,
        w: _deltaX,
        h: _deltaY,
    });

    // update image offset coordinate
    callback({
        status: 'draw', props: {},
        draw: drawBoundingBox.bind(
            this, pointer.selected.x, pointer.selected.y, _deltaX, _deltaY),
    });
}

/**
 * Scale selection by current render dimensions.
 * @param properties
 * @param pointer
 */

const scaleSelectBox = (pointer, properties) => {
    // get current render scale
    const scale = getScale(properties);

    // compute scaled dimensions / coordinates
    const updated = scalePoint({x: pointer.selectBox.x, y: pointer.selectBox.y}, properties);
    updated.w = Math.ceil(pointer.selectBox.w * scale.x);
    updated.h = Math.ceil(pointer.selectBox.h * scale.y);

    // adjust for negative select box dimensions
    if (updated.w < 0 ) {
        updated.w = Math.abs(updated.w);
        updated.x = updated.x - updated.w;
    }
    if (updated.h < 0 ) {
        updated.h = Math.abs(updated.h);
        updated.y = updated.y - updated.h;
    }

    return updated;
}