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
 * @public
 */

const Dialog = ({title, setToggle, children}) => {
    return (
        <div className={`dialog`}>
            <div className={'content-box'}>
                <div className={'dialog-header'}>
                    <Button
                        icon={'close'}
                        name={'close'}
                        label={'Close'}
                        onClick={() => {setToggle(null)}}
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
