/*!
 * MLP.Client.Tools.IAT.Resizer
 * File: resizer.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Message, { UserMessage } from '../common/message';
import InputSelector from '../selectors/input.selector';

/**
 * Adjustments to layer dimensions.
 *
 * @public
 * @return {JSX.Element}
 */

export const Resizer = ({
                            id = '',
                            properties,
                            setToggle,
                            options,
                            callback,
                        }) => {

    const [canvasDims, setCanvasDims] = React.useState({
            w: properties.base_dims.w,
            h: properties.base_dims.h
        });
    const [imageDims, setImageDims] = React.useState({
            w: properties.image_dims.w,
            h: properties.image_dims.h
        });

    // error state
    const [error, setError] = React.useState(null);

    // Handle dimensional change submission
    const _handleUpdate = () => {
        callback({
            status: 'render',
            props: {
                base_dims: canvasDims,
                image_dims: {
                    w: imageDims.w,
                    h: imageDims.h,
                },
                source_dims: {
                    w: properties.image_dims.w,
                    h: properties.image_dims.h,
                    x: 0,
                    y: 0
                },
                render_dims: {
                    w: imageDims.w,
                    h: imageDims.h,
                    x: 0,
                    y: 0
                }
            },
        });
        setToggle(false);
    };

    return <div>
        <UserMessage
            closeable={true}
            message={{ msg: error, type: 'error' }}
            onClose={() => {
                setError(null);
            }}
        />
        <ResizeOptions
            id={id}
            label={'Image Size'}
            data={imageDims}
            update={setImageDims}
            setError={setError}
            min={{ w: options.minImageWidth, h: options.minImageHeight }}
            max={{ w: options.maxImageWidth, h: options.maxImageHeight }}
        />
        <ResizeOptions
            id={id}
            label={'Canvas Size'}
            data={canvasDims}
            update={setCanvasDims}
            setError={setError}
            min={{ w: options.minCanvasWidth, h: options.minCanvasHeight }}
            max={{ w: options.maxCanvasWidth, h: options.maxCanvasHeight }}
        />
        <fieldset className={'submit h-menu'}>
            <ul>
                <li><Button
                    disabled={!!error}
                    icon={'success'}
                    label={`Update`}
                    title={`Update layer dimensions.`}
                    onClick={_handleUpdate}
                /></li>
                <li><Button
                    icon={'cancel'}
                    label={'Cancel'}
                    onClick={() => {
                        setToggle(false);
                    }}
                /></li>
            </ul>
        </fieldset>
    </div>;
};
/**
 * Resize options to layer dimensions.
 *
 * @public
 * @return {JSX.Element}
 */

export const ResizeOptions = ({
                                  id = '',
                                  label = '',
                                  data = {},
                                  update = () => {},
                                  setError = () => {},
                                  max = { w: 300, h: 300 },
                                  min = {w: 100, h: 100 }
                              }) => {

    // set resize parameter states
    // - ensure deep copy of initial values
    const [init, ] = React.useState(data);
    const [aspect, setAspect] = React.useState(true);
    const [scale, setScale] = React.useState(false);
    const [scaleFactor, setScaleFactor] = React.useState(1.0);

    // filter against dimension limits
    const _filterDims = (x, y) => {
        setError(null);
        if (x === 0 || y === 0) {
            setError(`Cannot have zero width or height.`);
        }
        if (x > max.w) {
            setError(`Width cannot exceed maximum of ${max.w} px.`);
        }
        if (y > max.h) {
            setError(`Height cannot exceed maximum of ${max.h} px.`);
        }
        if (x < min.w) {
            setError(`Width cannot be less than ${min.w} px.`);
        }
        if (y < min.h) {
            setError(`Height cannot be less than ${min.h} px.`);
        }
    };

    // Toggle aspect ratio toggle
    const _toggleAspect = () => {
        setAspect(!aspect);
        // reset scaling
        setScale(false);
        setScaleFactor(1.0);
        // reset dimensions
        update({ w: init.w, h: init.h });
    };

    // Toggle scaling
    const _toggleScale = () => {
        setScale(aspect ? !scale : false);
        setScaleFactor(1.0);
        // reset dimensions
        update({ w: init.w, h: init.h });
    };

    // Handle dimensional changes
    const _handleChange = (e) => {
        const { target = {} } = e || {};
        const { name = '', value = '' } = target;

        // compute aspect ratio (if enabled)
        const ratio = name === 'x' && aspect
            ? (init.h + 0.01) / (init.w + 0.01)
            : 1.0;

        // update dimensions
        const _x = name === 'x' ? parseInt(value) : data.w;

        // check if aspect ratio is locked (to scale height)
        const _y = name === 'y'
            ? parseInt(value)
            : aspect
                ? Math.floor(value * ratio)
                : data.h;

        // update data
        _filterDims(_x, _y);

        // update final dimensions
        update({ w: _x, h: _y });
    };

    // Handle scaling factor
    const _handleScale = (e) => {
        const { target = {} } = e || {};
        const { value = 1.0 } = target;
        setScaleFactor(value);
        // update dimensions
        _filterDims(init.w * value, init.h * value);
        update({ w: Math.floor(init.w * value), h: Math.floor(init.h * value) });
    };

    // Handle reset
    const _handleReset = () => {
        setAspect(true);
        setScale(false);
        setScaleFactor(1.0);
        update({ w: init.w, h: init.h });
    };

    // render download-as button
    return <>
        <fieldset className={'compact'}>
            <legend>{label}</legend>
            <div className={'h-menu centered'}>
                <ul>
                    <li>
                        <InputSelector
                            id={id}
                            name={'x'}
                            disabled={scale}
                            label={'Width'}
                            type={'int'}
                            value={data.w}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <InputSelector
                            id={id}
                            disabled={aspect || scale}
                            name={'y'}
                            label={'Height'}
                            type={'int'}
                            value={data.h}
                            onChange={_handleChange}
                        />
                    </li>
                    <li className={'push'}>
                        <Button
                            icon={'undo'}
                            label={'Reset'}
                            onClick={_handleReset}
                        /></li>
                </ul>
            </div>
            <div className={'h-menu'}>
                <ul>
                    <li>
                        <InputSelector
                            id={id}
                            name={'aspect'}
                            disabled={scale}
                            label={'Lock Aspect Ratio'}
                            type={'checkbox'}
                            value={aspect}
                            onChange={_toggleAspect}
                        /></li>
                    <li><InputSelector
                        id={id}
                        disabled={!aspect}
                        name={'scale'}
                        label={'Scale'}
                        type={'checkbox'}
                        value={scale}
                        onChange={_toggleScale}
                    /></li>
                    <li><InputSelector
                        id={id}
                        disabled={!aspect || !scale}
                        name={'scale_factor'}
                        label={'Factor'}
                        type={'float'}
                        value={scaleFactor}
                        onChange={_handleScale}
                    /></li>
                </ul>
            </div>
        </fieldset>
    </>;
};

export default Resizer;