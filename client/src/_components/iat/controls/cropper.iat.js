/*!
 * MLP.Client.Components.IAT.Cropper
 * File: cropper.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import InputSelector from '../../selectors/input.selector';
import Button from '../../common/button';
import {getScale} from './transform.iat';
import {useIat} from "../../../_providers/iat.provider.client";

/**
 * Creates cropper control panel component.
 *
 * @param properties
 * @param callback
 * @return
 */

const Cropper = ({ id, callback, update }) => {

    const iat = useIat();

    // render dimensions
    const pointer = iat[id].pointer;
    const properties = iat[id].properties;
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
        update(scaled.x, scaled.y, scaled.w, scaled.h);
    };

    // is the crop box empty?
    const isEmptyCropBox = pointer.selectBox.w === 0 && pointer.selectBox.h === 0;

    return <div className={'canvas-view-controls'}>
        <fieldset className={'super_compact'}>
            <div className={'h-menu centered'}>
                <ul>
                    <li>
                        <InputSelector
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
                        <InputSelector
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
                        <InputSelector
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
                        <InputSelector
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
                    <li>
                        <Button
                            disabled={isEmptyCropBox}
                            className={'success'}
                            icon={'crop'}
                            label={`Crop`}
                            onClick={callback}
                        />
                    </li>
                </ul>
            </div>
        </fieldset>
        </div>
}

export default Cropper;


/**
 * Scale selection by current render dimensions.
 * @param selectBox
 * @param properties
 */

const scaleSelectBox = (selectBox, properties) => {

    // get current render scale
    let scale = getScale(properties.image_dims, properties.render_dims);

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
