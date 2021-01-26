/*!
 * MLP.Client.Components.Common.Input
 * File: input.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import List from './list';

/**
 * Build input help text (error messages).
 *
 * @public
 * @param error
 */

const ValidationMessage = ({msg}) => {
    return (
        <List items={msg} classname={'validation'} />
    )
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
                   onchange,
                   onblur
}) => {

    // input conditional states
    const [autoClick, setAutoClick] = React.useState(true);

    console.log('Input:', value)

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
                    onBlur={onblur}
                />
                {error ? <ValidationMessage msg={error}/> : null}
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
                    onBlur={onblur}
                />
                {error ? <ValidationMessage msg={error}/> : null}
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
                    onBlur={onblur}
                    onClick={()=>{setAutoClick(false)}}
                    onFocus={()=>{setAutoClick(false)}}
                />
                {error ? <ValidationMessage msg={error}/> : null}
            </label>
        },
        select: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <select
                    id={name}
                    name={name}
                    onChange={onchange}
                    onBlur={onblur}
                >
                    {options
                        .map(opt =>
                            <option
                                key={`${name}_${opt.id}`}
                                id={`${name}_${opt.id}`}
                                name={`${name}_${opt.id}`}
                                value={opt.name}
                            >
                                {opt.label}
                            </option>
                        )
                    }
                </select>
                {error ? <ValidationMessage msg={error} /> : null}
            </label>
        }
    }

    // render input
    return _inputElements.hasOwnProperty(type)
        ? _inputElements[type]()
        : <div>Loading error</div>;
}

export default Input;
