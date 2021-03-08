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

const Dialog = ({title, label, icon, children, active=false}) => {

    // create dialog toggle
    const [toggle, setToggle] = React.useState(active);

    const handleOpen = () => {
        setToggle(true);
    };

    const handleClose = () => {
        setToggle(false);
    };

    return (
        <div>
            <Button onClick={handleOpen} label={label} icon={icon} title={title} />
            <div className={`dialog ${toggle ? 'active' : ''}`}>
                <div className={'content-box'}>
                    <div className={'dialog-header'}>
                        <Button icon={'close'} name={'cancel'} label={'Cancel'} onClick={handleClose} />
                    </div>
                    <h2 className={'dialog-title'} id="dialog-title">
                        {title}
                    </h2>
                    <div className={'dialog-body'} aria-labelledby="dialog-title">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dialog;
