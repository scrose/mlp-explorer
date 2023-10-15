/*!
 * MLE.Client.Components.Toolkit.Menu
 * File: menu.toolkit.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { useIat } from '../../_providers/toolkit.provider.client';
import Badge from "../common/badge";
import {getTooltip} from "../content/toolkit.help";
import {useUser} from "../../_providers/user.provider.client";
import {useNav} from "../../_providers/nav.provider.client";
import {useDialog} from "../../_providers/dialog.provider.client";

/**
 * Image Analysis Toolkit main menu.
 *
 * @public
 * @return {JSX.Element}
 */

export const MenuToolkit = () => {

    const iat = useIat();
    const user = useUser();
    const nav = useNav();
    const dialog = useDialog();

    // check load status of panels
    const imageLoaded = iat.panel1.status === 'loaded' || iat.panel2.status === 'loaded';
    const imagesLoaded = iat.panel1.status === 'loaded' && iat.panel2.status === 'loaded';

    return <div className={'canvas-menu-bar'}>
        <div className={'v-menu'}>
                <ul>
                    <li style={{width: '140px'}}><Badge label={'Image Tools'} icon={'toolbox'} /></li>
                    <li>
                        <Button
                            disabled={!imageLoaded}
                            title={'Select Pan Mode'}
                            className={iat.mode === 'pan' ? 'active' : ''}
                            icon={'move'}
                            label={'Pan'}
                            onClick={() => {
                                // clear messages
                                iat.setMessage(null);
                                iat.setMode('pan');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!imagesLoaded}
                            title={'Select Image Alignment Mode'}
                            label={'Align'}
                            className={iat.mode === 'select' ? 'active' : ''}
                            icon={'crosshairs'}
                            onClick={() => {
                                // clear messages
                                iat.setMessage(null);
                                iat.setMode('select');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!imagesLoaded}
                            icon={'images'}
                            label={'Compare'}
                            title={'Compare images using overlay.'}
                            onClick={() => {
                                iat.setDialog({
                                    type: 'compare',
                                    label: 'Compare Panel Images',
                                    callback: console.error,
                                });
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!imageLoaded}
                            title={'Select Crop Mode'}
                            label={'Crop'}
                            className={iat.mode === 'crop' ? 'active' : ''}
                            icon={'crop'}
                            onClick={() => {
                                // clear messages
                                iat.setMessage(null);
                                iat.setMode('crop');
                            }}
                        />
                    </li>
                    <li><Button
                        icon={'load'}
                        label={'Library'}
                        disabled={!imagesLoaded || !user || !user.isAdmin}
                        title={'Load an image into a panel.'}
                        onClick={() => {
                            nav.setToggle(true);
                            nav.setMode('tree');
                            dialog.setTooltip({
                                message: getTooltip('loadMLPImage'),
                                position: {x: 300, y: 300},
                                direction: 'left'
                            });
                        }}
                    /></li>
                    <li><Button
                        icon={'upload'}
                        label={'Upload'}
                        disabled={!imagesLoaded || !user || !user.isAdmin}
                        title={'Upload image to the MLP Library.'}
                        onClick={() => {
                            nav.setToggle(true);
                            nav.setMode('tree');
                            dialog.setTooltip({
                                message: getTooltip('uploadMLPImage'),
                                position: {x: 300, y: 300},
                                direction: 'left'
                            });
                        }}
                    /></li>
                </ul>
            </div>
        </div>;
};


