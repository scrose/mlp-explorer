/*!
 * MLP.Client.Tools.IAT.Resizer
 * File: iat.resizer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { UserMessage } from '../common/message';
import Input from '../common/input';

/**
 * Dimension limits
 */

const MAX_CANVAS_WIDTH = 600;
const MAX_CANVAS_HEIGHT = 500;
const MAX_IMAGE_WIDTH = 20000;
const MAX_IMAGE_HEIGHT = 20000;

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
                            callback,
                        }) => {

    const [canvasDims, setCanvasDims] = React.useState(
        { x: properties.base_dims.x, y: properties.base_dims.y },
    );
    const [imageDims, setImageDims] = React.useState(
        { x: properties.image_dims.x, y: properties.image_dims.y },
    );
    const [cropDims, setCropDims] = React.useState(
        { x: properties.crop_dims.x, y: properties.crop_dims.y },
    );

    // error state
    const [error, setError] = React.useState(null);

    // Handle dimensional change submission
    const _handleUpdate = () => {
        // update canvases
        callback({
            status: 'render',
            props: {
                base_dims: canvasDims,
                image_dims: imageDims,
                crop_dims: cropDims,
            },
        });
        setToggle(false);
    };

    return <div>
        <UserMessage
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
            max={{ x: MAX_IMAGE_WIDTH, y: MAX_IMAGE_HEIGHT }}
        />
        <ResizeOptions
            id={id}
            label={'Crop Size'}
            data={cropDims}
            update={setCropDims}
            setError={setError}
            max={{ x: Math.max(MAX_CANVAS_WIDTH), y: MAX_CANVAS_HEIGHT }}
        />
        <ResizeOptions
            id={id}
            label={'Canvas Size'}
            data={canvasDims}
            update={setCanvasDims}
            updateDependent={setCropDims}
            setError={setError}
            max={{ x: MAX_CANVAS_WIDTH, y: MAX_CANVAS_HEIGHT }}
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
                                  update = () => {
                                  },
                                  updateDependent= () => {},
                                  setError = () => {
                                  },
                                  max = { x: 300, y: 300 },
                              }) => {

    // set resize parameter states
    // - ensure deep copy of initial values
    const [init, setInit] = React.useState(data);
    const [aspect, setAspect] = React.useState(true);
    const [scale, setScale] = React.useState(false);
    const [scaleFactor, setScaleFactor] = React.useState(1.0);

    // filter against maximums
    const _filterDims = (x, y) => {
        setError(null);
        if (x === 0 || y === 0) {
            setError(`Cannot have zero width or height.`);
        }
        if (x > max.x) {
            setError(`Width cannot exceed maximum of ${max.x} px.`);
        }
        if (y > max.y) {
            setError(`Height cannot exceed maximum of ${max.y} px.`);
        }
    };

    // Toggle aspect ratio toggle
    const _toggleAspect = () => {
        setAspect(!aspect);
        // reset scaling
        setScale(false);
        setScaleFactor(1.0);
        // reset dimensions
        update({ x: init.x, y: init.y });
    };

    // Toggle scaling
    const _toggleScale = () => {
        setScale(aspect ? !scale : false);
        setScaleFactor(1.0);
        // reset dimensions
        update({ x: init.x, y: init.y });
    };

    // Handle dimensional changes
    const _handleChange = (e) => {
        const { target = {} } = e || {};
        const { name = '', value = '' } = target;

        // compute aspect ratio (if enabled)
        const ratio = name === 'x' && aspect
            ? (init.y + 0.01) / (init.x + 0.01)
            : 1.0;

        // update dimensions
        const _x = name === 'x' ? parseInt(value) : data.x;

        // check if aspect ratio is locked (to scale height)
        const _y = name === 'y'
            ? parseInt(value)
            : aspect
                ? Math.floor(value * ratio)
                : data.y;

        // update data
        _filterDims(_x, _y);

        // update secondary dimensions (if exist)
        // (e.g. adjust crop dimensions to be <= canvas dimensions)
        updateDependent({
            x: Math.max(data.x, max.x),
            y: Math.max(data.y, max.y)
        });

        // update final dimensions
        update({ x: _x, y: _y });
    };

    // Handle scaling factor
    const _handleScale = (e) => {
        const { target = {} } = e || {};
        const { value = 1.0 } = target;
        setScaleFactor(value);
        // update dimensions
        _filterDims(init.x * value, init.y * value);
        update({ x: Math.floor(init.x * value), y: Math.floor(init.y * value) });
    };

    // Handle reset
    const _handleReset = () => {
        setAspect(true);
        setScale(false);
        setScaleFactor(1.0);
        update({ x: init.x, y: init.y });
    };

    // render download-as button
    return <>
        <fieldset className={'compact'}>
            <legend>{label}</legend>
            <div className={'h-menu centered'}>
                <ul>
                    <li>
                        <Input
                            id={id}
                            name={'x'}
                            disabled={scale}
                            label={'Width'}
                            type={'int'}
                            value={data.x}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Input
                            id={id}
                            disabled={aspect || scale}
                            name={'y'}
                            label={'Height'}
                            type={'int'}
                            value={data.y}
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
                        <Input
                            id={id}
                            name={'aspect'}
                            disabled={scale}
                            label={'Lock Aspect Ratio'}
                            type={'checkbox'}
                            value={aspect}
                            onChange={_toggleAspect}
                        /></li>
                    <li><Input
                        id={id}
                        disabled={!aspect}
                        name={'scale'}
                        label={'Scale'}
                        type={'checkbox'}
                        value={scale}
                        onChange={_toggleScale}
                    /></li>
                    <li><Input
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