/*!
 * MLP.Client.Components.Common.Button
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from './icon';
import { redirect } from '../../_utils/paths.utils.client';

/**
 * Render .page footer
 *
 * @public
 * @return {React.Component}
 */

const Button = ({type, name, label, title, url, icon, onClick}) => {

    /**
     * Button constructors for different render types.
     *
     * @private
     * @return {Function} input constructor
     */

    // set default hover title
    title = title || label;

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
        },
        default: () => {
            return (
                <button
                    key={`key_${name}`}
                    title={title}
                    onClick={onClick}
                >
                    { icon ? <Icon type={icon} /> : ''}
                    <span>{label}</span>
                </button>
            )
        }
    }

    // render input
    return _buttonElements.hasOwnProperty(type)
        ? _buttonElements[type]()
        : _buttonElements.default();
}

export default Button;
