/*!
 * MLP.Client.Components.Common.Dialog
 * File: dialog.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';

/**
 * Dialog component.
 *
 * @param title
 * @param setToggle
 * @param callback
 * @param children
 * @public
 */

const Dialog = ({title, setToggle, callback=()=>{}, children}) => {
    return (
        <div className={`dialog`}>
            <div className={'content-box'}>
                <div className={'dialog-header'}>
                    <h2 className={'dialog-title'} id="dialog-title">{title}</h2>
                                <div style={{position: 'absolute', right: 0, top: '2px'}}>
                                    <Button
                                        label={'Close'}
                                        icon={'close'}
                                        name={'close'}
                                        className={'closer'}
                                        onClick={() => {
                                            setToggle(null);
                                            callback();
                                        }}
                                    />
                                </div>

                </div>
                <div className={'dialog-body'} aria-labelledby="dialog-title">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Dialog;
