/*!
 * MLP.Client.Components.Common.Alert
 * File: alert.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Dialog from './dialog';

/**
 * Alert dialog component.
 *
 * @public
 */

const Alert = ({title, description, setToggle, callback}) => {

    const handleAgree = () => {
        callback();
        setToggle(null);
    };
    const handleDisagree = () => {
        setToggle(null);
    };

    return (
        <Dialog setToggle={setToggle} title={title}>
            <div className={'alert-box'}>
                {description}
                <div className={'alert-box-buttons'}>
                    <Button icon={'success'} name={'ok'} label={'OK'} onClick={handleAgree} />
                    <Button icon={'cancel'} name={'cancel'} label={'Cancel'} onClick={handleDisagree} />
                </div>
            </div>
        </Dialog>
    );
}

export default Alert;
