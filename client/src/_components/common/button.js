/*!
 * MLP.Client.Components.Common.Button
 * File: footer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { reroute } from '../../_utils/paths.utils.client';
import Icon from './icon';

/**
 * Render .page footer
 *
 * @public
 * @return {React.Component}
 */

const Button = ({type, name, label, url, icon, onClick}) => {

    /**
     * Button constructors for different render types.
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
                    onClick={() => reroute(url)}
                >
                    <span>{label}</span>
                </button>
            )
        },
        default: () => {
            return (
                <button
                    key={`key_${name}`}
                    title={label}
                    onClick={() => onClick()}
                >
                    {icon ? <><Icon type={icon} />&#160;</> : ''}
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
