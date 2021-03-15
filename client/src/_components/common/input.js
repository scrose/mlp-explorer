/*!
 * MLP.Client.Components.Common.Input
 * File: input.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";


/**
 * Build datepicker widget using Pikaday module.
 *
 * @public
 * @param value
 */

const DateTimeSelector = ({value}) => {

    // create date state
    const [date, setDate] = React.useState({ val: value ? new Date(value) : new Date() });

    return <Flatpickr
        data-enable-time
        value={date.val}
        onChange={setDate} />

}

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
 * <input type="hidden">
 * <input type="button">
 * <input type="checkbox">
 * <input type="date">
 * <input type="email">
 * <input type="file" [multiple]>
 * <input type="image">
 * <input type="month">
 * <input type="number">
 * <input type="password">
 * <input type="radio">
 * <input type="text">
 * <textarea>
 * <input type="url">
 * <select>
 */

const Input = ({
                   id,
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

    // append unique ID value for input
    id = `${name}_${id}`;

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
                id={id}
                name={name}
                value={value || ''}
            />
        },

        text: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input
                    type={"text"}
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                />
                <ValidationMessage msg={error}/>
            </label>
        },

        textarea: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <textarea
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                />
                <ValidationMessage msg={error}/>
            </label>
        },

        checkbox: () => {
            const isChecked = (value && value === true);
            return <label key={`label_${name}`} htmlFor={id}>
                {label}
                <input
                    type={'checkbox'}
                    id={id}
                    name={name}
                    checked={isChecked}
                    onChange={onchange}
                />
            </label>;
        },

        date: () => {
            return <label key={`label_${name}`} htmlFor={name}>
                {label}
                <DateTimeSelector value={value || ''} />
            </label>;
        },

        email: () => {
            return <label key={`label_${name}`} htmlFor={id}>
                {label}
                <input
                    type={"email"}
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                />
                <ValidationMessage msg={error}/>
            </label>
        },

        password: () => {
            return <label key={`label_${name}`} htmlFor={id}>
                {label}
                <input
                    readOnly={autoClick}
                    type={"password"}
                    autoComplete="chrome-off"
                    id={id}
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
            return <label key={`label_${name}`} htmlFor={id}>
                {label}
                <select
                    id={id}
                    name={name}
                    onChange={onchange}
                >
                    {
                        options
                        .map(opt =>
                            <option
                                key={`${name}_${opt.id}`}
                                id={`${name}_${opt.id}_${id}`}
                                name={`${name}_${opt.id}`}
                                value={opt.id}
                            >
                                {opt.label}
                            </option>
                        )
                    }
                </select>
                <ValidationMessage msg={error} />
            </label>
        },

        files: () => {
            return <label key={`label_${name}`} htmlFor={id}>
                {label}
                <input
                    className={'multiple'}
                    type={"file"}
                    id={id}
                    name={name}
                    onChange={onchange}
                    multiple={true}
                />
                <ValidationMessage msg={error}/>
            </label>
        },

        file: () => {
            return <label key={`label_${name}`} htmlFor={id}>
                {label}
                <input
                    className={'single'}
                    type={"file"}
                    id={id}
                    name={name}
                    onChange={onchange}
                    multiple={false}
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
