/*!
 * MLP.Client.Components.Common.Dialog
 * File: dialog.js
 * Copyright(c) 2021 Runtime Software Development Inc.
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
                    <Button
                        icon={'close'}
                        name={'close'}
                        className={'closer'}
                        onClick={() => {
                            setToggle(null);
                            callback();
                        }}
                    />
                </div>
                <h2 className={'dialog-title'} id="dialog-title">
                    {title}
                </h2>
                <div className={'dialog-body'} aria-labelledby="dialog-title">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Dialog;
