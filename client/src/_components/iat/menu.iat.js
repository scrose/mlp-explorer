/*!
 * MLP.Client.Components.IAT.Menu
 * File: menu.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { useIat } from '../../_providers/iat.provider.client';
import Badge from "../common/badge";

/**
 * Image Analysis Toolkit main menu.
 *
 * @public
 * @return {JSX.Element}
 */

export const MenuIat = () => {

    const iat = useIat();

    // check load status of panels
    const imageLoaded = iat.panel1.status === 'loaded' || iat.panel2.status === 'loaded';
    const imagesLoaded = iat.panel1.status === 'loaded' && iat.panel2.status === 'loaded';

    return <div className={'canvas-menu-bar'}>
        <div className={'h-menu'}>
                <ul>
                    <li><Badge label={'Image Toolkit'} icon={'iat'} /></li>
                    <li>
                        <Button
                            disabled={!imageLoaded}
                            title={'Image edit mode.'}
                            className={iat.mode === 'default' ? 'active' : ''}
                            icon={'select'}
                            label={'Select'}
                            onClick={() => {
                                // clear messages
                                iat.setMessage(null);
                                iat.setMode('default');
                            }}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={!imageLoaded}
                            title={'Crop image.'}
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
                    <li>
                        <Button
                            disabled={!imagesLoaded}
                            title={'Set control coordinates for image alignment.'}
                            label={'Set Control Points'}
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
                </ul>
            </div>
        </div>;
};


