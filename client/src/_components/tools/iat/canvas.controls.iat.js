/*!
 * MLP.Client.Components.IAT.Canvas.Controls
 * File: iat.canvas.controls.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../../common/button';
import { moveBy, scaleToFit } from './transform.iat';

/**
 * No operation.
 */

const noop = () => {
};

/**
 * Inline menu component to edit node items.
 *
 * @public
 * @param {String} id
 * @param disabled
 * @param {Object} panel
 * @param trigger
 * @param pointer
 * @param options
 * @param {Function} setMessage
 * @param setDialogToggle
 * @return {JSX.Element}
 */

const CanvasControls = ({
                            id = '',
                            disabled = true,
                            panel = {},
                            trigger = {},
                            pointer = {},
                            options = {},
                            setMessage = noop,
                            setDialogToggle = noop,
                        }) => {

    /**
     * Handle errors.
     */

    const _handleError = (err) => {
        console.warn(err);
        setMessage(err);
    };

    /**
     * Canvas methods.
     *
     * @return {JSX.Element}
     */

        // fit image to base layer width
    const _fit = () => {
            const dims = scaleToFit(
                panel.props.source_dims.x,
                panel.props.source_dims.y,
                panel.props.base_dims.x,
            );
            // update panel properties
            panel.update({
                offset: { x: 0, y: 0 },
                data_dims: dims,
                pts: [],
            });
            // trigger update
            trigger.redraw();
            trigger.erase();
        };

    // expand to full-sized image
    const _expand = () => {
        // update panel properties
        panel.update({
            data_dims: {
                x: Math.min(panel.props.source_dims.x, panel.props.base_dims.x),
                y: Math.min(panel.props.source_dims.y, panel.props.base_dims.y),
            },
            pts: [],
        });
        // trigger update
        trigger.redraw();
        trigger.erase();
        trigger.reset();
    };

    // show image / canvas resize options
    const _resize = () => {
        setDialogToggle({ type: 'resize', id: panel.id });
    };

    // erase markup
    const _erase = () => {
        trigger.erase();
        panel.set('pts', []);
    };

    // reset the image data to source
    const _reset = () => {
        panel.update({
            render_dims: panel.props.source_dims,
            data_dims: {
                x: Math.min(panel.props.source_dims.x, panel.props.base_dims.x),
                y: Math.min(panel.props.source_dims.y, panel.props.base_dims.y),
            },
            offset: { x: 0, y: 0 },
            move: { x: 0, y: 0 },
            origin: { x: 0, y: 0 },
            pts: [],
        });
        trigger.reset();
    };

    // load new image to panel
    const _load = () => {
        setDialogToggle({ type: 'selectImage', id: panel.id });
    };

    // save image data as file
    const _save = () => {
        setDialogToggle({ type: 'saveImage', id: panel.id });
    };


    return <>
        <div className={'canvas-view-controls h-menu'}>
            <ul>
                <li><Button
                    icon={'load'}
                    title={'Load image into canvas.'}
                    onClick={_load}
                /></li>
                <li><Button
                    icon={'save'}
                    disabled={disabled}
                    title={'Save image file.'}
                    onClick={_save}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'resize'}
                    title={'Resize Image / Canvas.'}
                    onClick={_resize}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'undo'}
                    title={'Reset to original image.'}
                    onClick={_reset}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'compress'}
                    title={'Scale image to fit canvas.'}
                    onClick={_fit}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'enlarge'}
                    title={'Show full-sized image in canvas.'}
                    onClick={_expand}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'erase'}
                    title={'Erase canvas annotations.'}
                    onClick={_erase}
                /></li>
            </ul>
            {/*    <Button label={'w'} />*/}
            {/*    <Button label={'H'} />*/}
            {/*    <Button label={'h'} />*/}
            {/*    <Button label={'L'} />*/}
            {/*    <Button label={'R'} />*/}
            {/*    <Button label={'U'} />*/}
            {/*    <Button label={'D'} />*/}
            {/*    <Button label={'C'} />*/}
            {/*    <Button label={'A'} />*/}
            {/*    <Button label={'F'} />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <option label={'Above'} />*/}
            {/*    <select onChange={callback}>*/}
            {/*        <option label={'Above'} />*/}
            {/*        <option label={'Beside'} />*/}
            {/*        <option label={'Auto'} />*/}
            {/*        <option label={'Max'} />*/}
            {/*    </select>*/}
            {/*    <select onChange={callback}>*/}
            {/*        <option label={'Show Normal'} />*/}
            {/*        <option label={'Show All'} />*/}
            {/*        <option label={'Images Only'} />*/}
            {/*        <option label={'Objects Only'} />*/}
            {/*        <option label={'All Objects'} />*/}
            {/*        <option label={'Inverted'} />*/}
            {/*    </select>*/}
        </div>
    </>;
};
export default CanvasControls;

/**
 * Filter input key presses for image methods.
 * - selects methods for given key press.
 *
 * @private
 * @return {JSX.Element}
 */

export const filterKeyDown = (e,
                              layers,
                              panel,
                              trigger,
                              pointer,
                              options) => {
    const { keyCode = '' } = e || {};
    const _methods = {
        // move canvas left 1 pixel
        37: () => {
            moveBy(e, panel, trigger, -1, 0);
        },
        // move canvas right 1 pixel
        39: () => {
            moveBy(e, panel, trigger, 1, 0);
        },
        // move canvas up 1 pixel
        40: () => {
            moveBy(e, panel, trigger, 0, 1);
        },
        // move canvas down 1 pixel
        38: () => {
            moveBy(e, panel, trigger, 0, -1);
        },
        // enable magnifier
        32: () => {
            pointer.magnifyOn();
        }
    };
    return _methods.hasOwnProperty(keyCode)
        ? _methods[keyCode]()
        : null;
};

/**
 * Filter input key presses for image methods.
 * - selects methods for given key press.
 *
 * @private
 * @return {JSX.Element}
 */

export const filterKeyUp = (e,
                            layers,
                            panel,
                            trigger,
                            pointer,
                            options) => {
    const { keyCode = '' } = e || [];
    const _methods = {
        // disable magnifier
        32: () => {
            pointer.magnifyOff();
        }
    };
    return _methods.hasOwnProperty(keyCode)
        ? _methods[keyCode]()
        : null;
};