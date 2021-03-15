/*!
 * MLP.Client.Components.Common.Button
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from './icon';

/**
 * Render HTML button element.
 *
 * @public
 * @return {React.Component}
 */

const Button = ({type, name, label='', title, icon, className='', onClick}) => {

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
                    title={`Submit update.`}
                    type={type}
                    name={name}
                    value={label}
                />)
        },
        default: () => {
            return (
                <button
                    title={title}
                    className={className}
                    onClick={onClick}
                >
                    { icon ? <Icon type={icon} /> : ''}{ label ? <span>{label}</span> : ''}
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
