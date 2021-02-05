/*!
 * MLP.Client.Components.Common.PopUp
 * File: popup.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Icon from './icon';

/**
 * Alert dialog component.
 *
 * @public
 */

const Alert = ({title, description, icon, label, callback}) => {

    const [toggle, setToggle] = React.useState(false);

    const handleClickOpen = () => {
        setToggle(true);
    };

    const handleClose = () => {
        setToggle(false);
    };

    const handleAgree = () => {
        callback();
        handleClose();
    };
    const handleDisagree = () => {
        handleClose();
    };

    return (
        <div className={'alert'}>
            <Button onClick={handleClickOpen} label={label} icon={icon} />
            <div className={`dialog ${toggle ? 'active' : ''}`}>
                <div className={'alert-box'}>
                    <div className={'alert-box-content'} aria-labelledby="alert-dialog-title">
                        <h2 id="alert-dialog-title">
                            {title}
                        </h2>
                        <div id="alert-dialog-description">
                            {description}
                        </div>
                        <div className={'alert-box-buttons'}>
                            <Button icon={'success'} name={'ok'} label={'OK'} onClick={handleAgree} />
                            <Button icon={'cancel'} name={'cancel'} label={'Cancel'} onClick={handleDisagree} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Alert;
