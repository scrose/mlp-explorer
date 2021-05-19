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

export const Submit = ({
                           model,
                           label = '',
                           message,
                           onCancel,
                           onReset,
                           onSubmit = true,
                       }) => {


    console.log('submit:', onCancel)

    const { msg = '', type = '' } = message || {};
    return (
        <fieldset className={'submit'}>
            {msg &&
            <div className={`msg ${type}`}>
                <span>{msg}</span>
            </div>}
            {onSubmit &&
            <Button
                className={'submit'}
                type={'submit'}
                label={label || 'Submit'}
                name={`submit_${model}`}
            />}
            {onReset &&
            <Button
                type={'reset'}
                label={'Reset'}
                name={`reset_${model}`}
                onClick={onReset}
            />}
            {onCancel &&
            <Button
                className={'cancel'}
                type={'cancel'}
                label={'Cancel'}
                name={`cancel_${model}`}
                onClick={(e) => {
                    e.preventDefault();
                    onCancel()
                }}
            />}
        </fieldset>

    );
};