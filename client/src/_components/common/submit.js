/*!
 * MLP.Client.Components.Common.Submit
 * File: submit.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';

/**
 * Form submission buttons component.
 *
 * @public
 * @param { model, label }
 */

export const Submit = ({ model, label = '', message, cancel, reset, submit = true }) => {
    const { msg = '', type = '' } = message || {};
    return (
        <fieldset className={'submit'}>
            {msg ?
                <div className={`msg ${type}`}>
                    <span>{msg}</span>
                </div>
                : ''
            }
            {submit ?
                <Button
                    className={'submit'}
                    type={'submit'}
                    label={label || 'Submit'}
                    name={`submit_${model}`}
                /> : ''
            }
            {reset ?
                <Button
                    type={'reset'}
                    label={'Reset'}
                    name={`reset_${model}`}
                    onClick={reset}
                /> : ''
            }
            {cancel ?
                <Button
                    className={'cancel'}
                    type={'cancel'}
                    label={'Cancel'}
                    name={`cancel_${model}`}
                    onClick={cancel}
                /> : ''
            }
        </fieldset>

    );
};