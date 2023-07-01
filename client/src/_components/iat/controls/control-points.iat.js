/*!
 * MLP.Client.Components.IAT.Control-Points
 * File: control-points.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import Button from '../../common/button';
import React, {useState} from 'react';
import {correlation} from '../../../_utils/iat.utils.client';
import Badge from '../../common/badge';
import {useIat} from "../../../_providers/iat.provider.client";
import InputSelector from "../../selectors/input.selector";

/**
 * Show selected control points. Allows for deletion of last point.
 *
 * @param id
 * @param callback
 * @public
 */

const ControlPoints = ({ id }) => {

    const iat = useIat();
    const pointer = iat[id].pointer;
    const properties = iat[id].properties;
    const [selectedIndex, setSelectedIndex] = useState(null);

    /**
     * Update selected control point with input value
     *
     * @private
     */

    const _handleChange = (e) => {
        const { target = {} } = e || {};
        const { name = '', value = '' } = target;

        // get selected control point
        const ctrlPt = pointer.points[selectedIndex];
        if (!ctrlPt) return;

        // compute new coordinates
        const _x = name === 'x' ? Math.max(Math.min(parseInt(value), properties.image_dims.w), 0) : ctrlPt.x;
        const _y = name === 'y' ? Math.max(Math.min(parseInt(value), properties.image_dims.h), 0) : ctrlPt.y;

        // update panel control point position
        const controlPoints = [...pointer.points];
        controlPoints[selectedIndex] = {x: _x, y: _y};
        pointer.setPoints(controlPoints);

    }

    /**
     * Update selected control point with input value
     *
     * @private
     */

    const _handleDelete = () => {

        // get selected control point
        const ctrlPt = pointer.points[selectedIndex];
        if (!ctrlPt) return;

        // delete panel control point from array
        pointer.setPoints(pointer.points.filter((item, index) => index !== selectedIndex));
        setSelectedIndex(null)

    }

    /**
     * Toggle display of opposite panel control points
     *
     * @private
     */

    const _toggleOverlay = () => {
        iat[id].setProperties(props => ({
            ...props,
            overlay: !props.overlay
        }));

    }

    /**
     * Show the coordinate input fields for the control point index
     *
     * @private
     */

    const _showEdit = (index) => {
        selectedIndex === index ? setSelectedIndex(null) : setSelectedIndex(index)
    }

    // compute pearson correlation coefficient to test collinearity
    const corr = Math.abs(correlation(pointer.points)).toFixed(2);

    return <>
        {
            (pointer.points || []).length > 0 &&
            <div className={'canvas-view-control-points h-menu'}>
                <ul>
                    <li>
                        <Badge
                            className={corr < 0.8 ? 'success' : 'warning'}
                            icon={corr < 0.8 ? 'success' : 'warning'}
                            label={`Collinearity: ${corr}`}
                        />
                    </li>
                    <li>
                        <Button
                            onClick={() => _toggleOverlay()}
                            className={properties.overlay ? 'success' : 'warning'}
                            icon={'crosshairs'}
                            label={'Overlay'}
                            title={`Display control points from opposite panel.`}
                        />
                    </li>
                    {
                        // show selected control points
                        pointer.points.map((pt, index) => {
                            return <li key={`${id}_ctrlpt_${index}`}>
                                <Button
                                    onClick={() => _showEdit(index)}
                                    key={`${id}_selected_pt_${index}`}
                                    icon={'crosshairs'}
                                    label={index + 1}
                                    title={`Control point at (${pt.x}, ${pt.y})`}
                                />
                                {
                                    selectedIndex === index && <fieldset className={'compact'}>
                                        <div className={'canvas-view-controls h-menu'}>
                                            <ul>
                                                <li>
                                                    <InputSelector
                                                        id={id}
                                                        name={'x'}
                                                        label={'X'}
                                                        type={'int'}
                                                        value={pt.x}
                                                        min={0}
                                                        max={properties.image_dims.w}
                                                        onChange={_handleChange}
                                                    />
                                                </li>
                                                <li>
                                                    <InputSelector
                                                        id={id}
                                                        name={'y'}
                                                        label={'Y'}
                                                        type={'int'}
                                                        value={pt.y}
                                                        min={0}
                                                        max={properties.image_dims.h}
                                                        onChange={_handleChange}
                                                    />
                                                </li>
                                                <li>
                                                    <Button
                                                        className={'push'}
                                                        icon={'delete'}
                                                        title={`Delete control point`}
                                                        onClick={_handleDelete}
                                                    />
                                                </li>
                                            </ul>
                                        </div>
                                    </fieldset>
                                }
                            </li>;
                        })
                    }
                </ul>
            </div>
        }
    </>;
};

export default ControlPoints;