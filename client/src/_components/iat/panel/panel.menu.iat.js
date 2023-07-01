/*!
 * MLP.Client.Components.IAT.Panel.Menu
 * File: panel.menu.iat.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {memo} from 'react';
import Button from '../../common/button';
import {useIat} from "../../../_providers/iat.provider.client";

/**
 * Control menu for IAT panel.
 *
 * @public
 * @param {String} id
 * @param ref
 * @param {Object} methods
 * @return {JSX.Element}
 */


const PanelMenu = ({id = null, methods=null}) => {

    const iat = useIat();
    const panel = iat && id ? iat[id] : {};
    const disabled = panel.status !== 'loaded' || !panel.image;

    // check load status of panels
    const imagesLoaded = iat.panel1.status === 'loaded' && iat.panel2.status === 'loaded';
    const hasControlPoints = iat.panel1.pointer.points.length === iat.options.controlPtMax
        && iat.panel2.pointer.points.length === iat.options.controlPtMax

    return <>
        {
            panel &&
            <div className={'canvas-view-controls h-menu'}>
                <ul>
                    <li><Button
                        icon={'load'}
                        title={'Load image into canvas.'}
                        onClick={() => {
                            iat.setDialog({
                                type: 'loadImage',
                                id: panel.properties.id,
                                label: panel.properties.label,
                                callback: methods.load
                            });
                        }}
                    /></li>
                    <li><Button
                        icon={'save'}
                        disabled={disabled}
                        title={'Save image file.'}
                        onClick={() => {
                            iat.setDialog({
                                type: 'saveImage',
                                id: panel.properties.id,
                                label: panel.properties.label,
                                callback: methods.saveAs,
                            });
                        }}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'undo'}
                        title={'Reset to original source image.'}
                        onClick={methods.reset}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'resize'}
                        title={'Resize image and/or canvas.'}
                        onClick={() => {
                            iat.setDialog({
                                type: 'resize',
                                id: id,
                                label: panel.properties.label,
                                callback: methods.resize,
                            });
                        }}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'compress'}
                        title={'Scale image to fit canvas.'}
                        onClick={methods.fit}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'enlarge'}
                        title={'Show full-sized image in canvas.'}
                        onClick={methods.expand}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'zoomIn'}
                        title={'Zoom in.'}
                        onClick={methods.zoomIn}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'zoomOut'}
                        title={'Zoom out.'}
                        onClick={methods.zoomOut}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'erase'}
                        title={'Erase Mask Overlay.'}
                        onClick={methods.clear}
                    /></li>
                    <li>
                        <Button
                            disabled={!hasControlPoints || !imagesLoaded || iat.mode !== 'select'}
                            className={hasControlPoints && imagesLoaded && iat.mode === 'select' ? 'success' : ''}
                            icon={'crosshairs'}
                            label={'Register'}
                            title={'Register images using selected control points.'}
                            onClick={methods.align}
                        />
                    </li>
                </ul>
            </div>
        }
    </>;
};
export default memo(PanelMenu);

