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

const Button = ({
                    type,
                    name,
                    label='',
                    title,
                    icon,
                    size='lg',
                    className='',
                    spin=false,
                    onClick=()=>{}
}) => {

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
                <button
                    className={className}
                    title={`Submit update.`}
                    type={'submit'}
                    name={name}>
                    { icon ? <Icon type={icon} size={size} /> : ''}{ label ? <span>{label}</span> : ''}
                </button>
            )
        },
        reset: () => {
            return (
                <input
                    className={className}
                    title={`Reset form.`}
                    type={'reset'}
                    name={name}
                    value={label}
                    onClick={onClick}
                />)
        },
        rightAlign: () => {
            return (
                <button
                    title={title}
                    className={className}
                    onClick={onClick}
                    name={name}
                >
                    { label ? <span>{label}</span> : ''}{ icon ? <Icon type={icon} size={size} /> : ''}
                </button>)
        },
        default: () => {
            return (
                <button
                    title={title}
                    className={className}
                    onClick={onClick}
                    name={name}
                >
                    { icon ? <Icon type={icon} size={size} spin={spin} /> : ''}{ label ? <span>{label}</span> : ''}
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
