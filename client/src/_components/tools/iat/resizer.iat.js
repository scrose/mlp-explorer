/*!
 * MLP.Client.Tools.IAT.Resizer
 * File: iat.resizer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../../common/button';
import { UserMessage } from '../../common/message';
import Input from '../../common/input';

/**
 * Dimension limits
 */

const MAX_CANVAS_WIDTH = 600;
const MAX_CANVAS_HEIGHT = 500;
const MAX_RENDER_WIDTH = 20000;
const MAX_RENDER_HEIGHT = 20000;

/**
 * Adjustments to layer dimensions.
 *
 * @public
 * @return {JSX.Element}
 */

export const Resizer = ({
                            id = '', setSize = () => {
    }, props = () => {
    }, setToggle = () => {
    },
                        }) => {

    const [baseDims, setBaseDims] = React.useState(
        { x: props.base_dims.x, y: props.base_dims.y },
    );
    const [renderDims, setRenderDims] = React.useState(
        { x: props.render_dims.x, y: props.render_dims.y },
    );

    // Handle dimension change submission
    const _handleUpdate = () => {
        setSize(data => ({
            ...data,
            resize: true,
            base_dims: baseDims,
            render_dims: renderDims,
        }));
        setToggle(false);
    };

    return <div>
        <ResizeOptions
            id={id}
            label={'Image Size'}
            data={renderDims}
            update={setRenderDims}
            max={{ x: MAX_RENDER_WIDTH, y: MAX_RENDER_HEIGHT }}
        />
        <ResizeOptions
            id={id}
            label={'Canvas Size'}
            data={baseDims}
            update={setBaseDims}
            max={{ x: MAX_CANVAS_WIDTH, y: MAX_CANVAS_HEIGHT }}
        />
        <fieldset className={'submit h-menu'}>
            <ul>
            <li><Button
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
                                  id='',
                                  label = '',
                                  data = {},
                                  update = () => {},
                                  max={x: 300, y: 300}
                              }) => {

    // set resize parameter states
    // - ensure deep copy of initial values
    const [error, setError] = React.useState(null);
    const [init, setInit] = React.useState(data);
    const [aspect, setAspect] = React.useState(true);
    const [scale, setScale] = React.useState(false);
    const [scaleFactor, setScaleFactor] = React.useState(1.0);

    // filter against maximums
    const _filterDims = (x, y) => {
        setError(null);
        if (x === 0 || y === 0) {
            setError(`Cannot have zero width or height.` );
            return false;
        }
        if (x > max.x) {
            setError(`Width cannot exceed maximum of ${max.x} px.`);
            return false;
        }
        if (y > max.y) {
            setError(`Height cannot exceed maximum of ${max.y} px.`);
            return false;
        }
        return true;
    }

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
        const _x = name === 'x' ? value : data.x;

        // check if aspect ratio is locked (to scale height)
        const _y = name === 'y'
            ? value
            : aspect
                ? Math.floor(value * ratio)
                : data.y;

        // update data
        if (_filterDims(_x, _y)) update({ x: _x, y: _y });
    };

    // Handle scaling factor
    const _handleScale = (e) => {
        const { target = {} } = e || {};
        const { value = 1.0 } = target;
        setScaleFactor(value);
        // update dimensions
        if (_filterDims(init.x * value, init.y * value)) {
            update({ x: Math.floor(init.x * value), y: Math.floor(init.y * value) });
        }
    };

    // Handle reset
    const _handleReset = (e) => {
        setAspect(true);
        setScale(false);
        setScaleFactor(1.0);
        update({ x: init.x, y: init.y });
    };

    // render download-as button
    return <>
        <UserMessage
            message={{ msg: error, type: 'error' }}
            onClose={() => {
                setError(null);
            }}
        />
        <fieldset>
            <legend>{label}</legend>
            <div className={'h-menu'}>
                <Input
                    id={id}
                    name={'x'}
                    disabled={scale}
                    label={'Width'}
                    type={'int'}
                    value={data.x}
                    onChange={_handleChange}
                />
                <Input
                    id={id}
                    disabled={aspect || scale}
                    name={'y'}
                    label={'Height'}
                    type={'int'}
                    value={data.y}
                    onChange={_handleChange}
                />
                <Button
                    icon={'undo'}
                    onClick={_handleReset}
                />
            </div>
            <div className={'h-menu'}>
                <Input
                    id={id}
                    name={'aspect'}
                    disabled={scale}
                    label={'Lock Aspect Ratio'}
                    type={'checkbox'}
                    value={aspect}
                    onChange={_toggleAspect}
                />
                <Input
                    id={id}
                    disabled={!aspect}
                    name={'scale'}
                    label={'Scale'}
                    type={'checkbox'}
                    value={scale}
                    onChange={_toggleScale}
                />
                <Input
                    id={id}
                    disabled={!aspect || !scale}
                    name={'scale_factor'}
                    label={'Factor'}
                    type={'float'}
                    value={scaleFactor}
                    onChange={_handleScale}
                />
            </div>
        </fieldset>
    </>;
};

export default Resizer;