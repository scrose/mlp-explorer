/*!
 * MLP.Client.Components.Common.Button
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { redirect } from '../../_utils/paths.utils.client';

/**
 * Render .page footer
 *
 * @public
 * @return {React.Component}
 */

const Button = ({type, name, label, url}) => {

    /**
     * Button constructors for different types.
     *
     * @private
     * @return {Function} input constructor
     */

    const _buttonElements = {
        submit: () => {
            return (
                <input
                    key={`key_submit_${name}`}
                    title={`Submit update.`}
                    type={type}
                    name={name}
                    value={label}
                />)
        },
        cancel: () => {
            return (
                <button
                    key={`key_cancel_${name}`}
                    className={'cancel'}
                    title={`Cancel update.`}
                    onClick={() => redirect(url)}
                >
                    <span>{label}</span>
                </button>
            )
        }
    }

    // render input
    return _buttonElements.hasOwnProperty(type)
        ? _buttonElements[type]()
        : <div>Loading error</div>;
}

export default Button;
