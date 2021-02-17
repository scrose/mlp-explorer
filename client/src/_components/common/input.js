/*!
 * MLP.Client.Components.Common.Input
 * File: input.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import List from './list';

/**
 * Build input help text (error messages). Only prints
 * first message to window.
 *
 * @public
 * @param error
 */

const ValidationMessage = ({msg}) => {
    return  <div className={'validation'}>
                <span>{msg.length > 0 ? msg[0] : ''}</span>
            </div>
}

/**
 * Form input component.
 *
 * <input type="button">
 * <input type="checkbox">
 * <input type="date">
 * <input type="datetime-local">
 * <input type="email">
 * <input type="file">
 * <input type="hidden">
 * <input type="image">
 * <input type="month">
 * <input type="number">
 * <input type="password">
 * <input type="radio">
 * <input type="reset">
 * <input type="search">
 * <input type="text">
 * <input type="time">
 * <input type="url">
 * <input type="week">
 * <select>
 */

const Input = ({
                   type,
                   name,
                   label,
                   value,
                   error,
                   readonly,
                   options,
                   onchange
}) => {

    // input conditional states
    const [autoClick, setAutoClick] = React.useState(true);

    /**
     * Input constructors for different render types.
     *
     * @private
     * @return {Function} input constructor
     */

    const _inputElements = {

        hidden: () => {
            return <input
                readOnly={true}
                type={"hidden"}
                id={name} name={name}
                value={value || ''}
            />
        },

        text: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input
                    type={"text"}
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                />
                <ValidationMessage msg={error}/>
            </label>
        },

        checkbox: () => {
            const isChecked = (value && value === true);
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input
                    type={'checkbox'}
                    id={name}
                    name={name}
                    checked={isChecked}
                    onChange={onchange}
                />
            </label>;
        },

        email: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input
                    type={"email"}
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                />
                <ValidationMessage msg={error}/>
            </label>
        },

        password: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input
                    readOnly={autoClick}
                    type={"password"}
                    autoComplete="chrome-off"
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                    onClick={()=>{setAutoClick(false)}}
                    onFocus={()=>{setAutoClick(false)}}
                />
                <ValidationMessage msg={error}/>
            </label>
        },

        select: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <select
                    id={name}
                    name={name}
                    onChange={onchange}
                >
                    {options
                        .map(opt =>
                            <option
                                key={`${name}_${opt.name}`}
                                id={`${name}_${opt.name}`}
                                name={`${name}_${opt.name}`}
                                value={opt.name}
                            >
                                {opt.label}
                            </option>
                        )
                    }
                </select>
                <ValidationMessage msg={error} />
            </label>
        },

        file: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input
                    type={"file"}
                    id={name}
                    name={name}
                    onChange={onchange}
                    multiple={true}
                />
                <ValidationMessage msg={error}/>
            </label>
        }
    }

    // render input
    return _inputElements.hasOwnProperty(type)
        ? _inputElements[type]()
        : <div>Loading error</div>;
}

export default Input;
