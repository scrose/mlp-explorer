/*!
 * MLE.Client.Components.Toolkit.Register
 * File: register.toolkit.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import Button from '../../common/button';
import React, {useState} from 'react';
import Badge from '../../common/badge';
import {useIat} from "../../../_providers/toolkit.provider.client";
import InputSelector from "../../selectors/input.selector";
import {correlation} from "../utils/align.utils.toolkit";
import {scalePoint} from "./scaler.toolkit";

/**
 * Show selected control points for image alignment/registration. Allows for editing and deletion of points.
 *
 * @param id
 * @param aligned
 * @param callback
 * @param update
 * @param clear
 * @public
 */

const Register = ({ id, aligned, callback, update, clear }) => {

    const iat = useIat();
    const pointer = iat[id].pointer;
    const properties = iat[id].properties;
    const [selectedIndex, setSelectedIndex] = useState(null);

    // check load status of panels
    const imagesLoaded = iat.panel1.status === 'loaded' && iat.panel2.status === 'loaded';
    const hasControlPoints = iat.panel1.pointer.points.length === iat.options.controlPtMax
        && iat.panel2.pointer.points.length === iat.options.controlPtMax

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

        // update render view
        update(controlPoints.map(ctrlPt => {
            // scale control point to render view
            return scalePoint(ctrlPt, properties.render_dims, properties.image_dims);
        }));
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
     * Delete all control points
     *
     * @private
     */

    const _handleDeleteAll = () => {
        pointer.setPoints([]);
        setSelectedIndex(null);
        iat[id].setProperties(props => ({
            ...props,
            overlay: false
        }));
        clear();
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
                            className={corr < 0.8 ? 'info' : 'error'}
                            icon={corr < 0.8 ? 'success' : 'warning'}
                            label={`Collinearity: ${corr}`}
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
                                    selectedIndex === index &&
                                        <div style={{position: 'absolute'}}>
                                            <fieldset className={'compact'}>
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
                                                <li className={'push'}>
                                                    <Button
                                                        icon={'delete'}
                                                        title={`Delete control point`}
                                                        onClick={_handleDelete}
                                                    />
                                                </li>
                                            </ul>
                                            </fieldset>
                                        </div>
                                }
                            </li>;
                        })
                    }
                    <li className={'push'}>
                        <Button
                            onClick={() => _toggleOverlay()}
                            className={properties.overlay ? 'info' : 'warning'}
                            icon={'crosshairs'}
                            label={'Overlay'}
                            title={`Display control points from opposite panel.`}
                        />
                    </li>
                    <li>
                        <Button
                            onClick={_handleDeleteAll}
                            icon={'delete'}
                            label={'Clear'}
                            title={`Delete all control points`}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!hasControlPoints || !imagesLoaded || aligned}
                            className={hasControlPoints && imagesLoaded ? 'success' : ''}
                            icon={'crosshairs'}
                            label={'Align'}
                            title={'Align images using selected control points.'}
                            onClick={callback}
                        />
                    </li>
                </ul>
            </div>
        }
    </>;
};

export default Register;


