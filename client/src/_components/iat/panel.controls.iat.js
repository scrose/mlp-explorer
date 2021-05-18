/*!
 * MLP.Client.Components.IAT.Canvas.Controls
 * File: iat.canvas.controls.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { crop, moveBy } from './transform.iat';
import { erase, expand, fit, reset } from './canvas.iat';
import { loadImageData } from './loader.iat';
import { useUser } from '../../_providers/user.provider.client';

/**
 * No operation.
 */

const noop = () => {};

/**
 * Control menu for IAT panel.
 *
 * @public
 * @param {boolean} disabled
 * @param {Object} properties
 * @param pointer
 * @param setSignal
 * @param callback
 * @param setDialogToggle
 * @return {JSX.Element}
 */

const PanelControls = ({
                           disabled = true,
                           properties = {},
                           setSignal = noop,
                           callback = noop,
                           setDialogToggle = noop,
                       }) => {

    const user = useUser();

    return <>
        <div className={'canvas-view-controls h-menu'}>
            <ul>
                <li><Button
                    icon={'load'}
                    title={'Load image into canvas.'}
                    onClick={() => {
                        setSignal('loading');
                        setDialogToggle({
                            type: 'selectImage',
                            id: properties.id,
                            label: properties.label,
                            callback: (data) => {
                                loadImageData(data, callback).catch(callback);
                            },
                        });
                    }}
                /></li>
                <li><Button
                    icon={'upload'}
                    disabled={disabled || !user || !properties.files_id}
                    title={'Upload to MLP Library.'}
                    onClick={() => {
                        setDialogToggle({
                            type: 'uploadImage',
                            id: properties.id,
                            label: properties.label,
                            callback: callback,
                        });
                    }}
                /></li>
                <li><Button
                    icon={'save'}
                    disabled={disabled}
                    title={'Save image file.'}
                    onClick={() => {
                        setSignal('loading');
                        setDialogToggle({
                            type: 'saveImage',
                            id: properties.id,
                            label: properties.label,
                            callback: callback,
                        });
                    }}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'resize'}
                    title={'Resize image and/or canvas.'}
                    onClick={() => {
                        setSignal('loading');
                        setDialogToggle({
                            type: 'resize',
                            id: properties.id,
                            label: properties.label,
                            callback: callback,
                        });
                    }}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'undo'}
                    title={'Reset to original image.'}
                    onClick={() => {
                        reset(properties, callback).catch(callback);
                    }}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'compress'}
                    title={'Scale image to fit canvas.'}
                    onClick={() => {
                        fit(properties, callback).catch(callback);
                    }}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'enlarge'}
                    title={'Show full-sized image in canvas.'}
                    onClick={() => {
                        expand(properties, callback).catch(callback);
                    }}
                /></li>
                <li><Button
                    disabled={disabled}
                    icon={'erase'}
                    title={'Erase Mask Overlay.'}
                    onClick={() => {
                        erase(properties, callback).catch(callback);
                    }}
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
export default React.memo(PanelControls);

/**
 * Filter input key presses for image methods.
 * - selects methods for given key press.
 *
 * @private
 * @return {JSX.Element}
 */

export const filterKeyDown = (e, properties, pointer, options, callback) => {

    const { keyCode = '' } = e || {};

    const _methods = {
        // update
        13: () => {
            crop(pointer, properties, callback);
        },
        // move canvas left 1 pixel
        37: () => {
            moveBy(e, properties, -1, 0, callback);
        },
        // move canvas right 1 pixel
        39: () => {
            moveBy(e, properties, 1, 0, callback);
        },
        // move canvas up 1 pixel
        40: () => {
            moveBy(e, properties, 0, 1, callback);
        },
        // move canvas down 1 pixel
        38: () => {
            moveBy(e, properties, 0, -1, callback);
        },
        // enable magnifier
        32: () => {
            pointer.magnifyOn();
        },
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

export const filterKeyUp = (e, properties, pointer, options, callback) => {

    const { keyCode = '' } = e || [];
    const _methods = {
        // disable magnifier
        32: () => {
            pointer.magnifyOff();
        },
    };
    return _methods.hasOwnProperty(keyCode)
        ? _methods[keyCode]()
        : null;
};