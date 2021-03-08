/*!
 * MLP.Client.Components.Common.Input
 * File: input.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import Button from './button';

/**
 * Build datepicker widget using Pikaday module.
 *
 * @public
 */

const AttachFile = ({type, id, name, onChange, value, label, error}) => {

    return <fieldset>
        <label key={`label_${name}`} htmlFor={name}>
            {label}
            <input
                type={"file"}
                name={name}
                onChange={onChange}
                multiple={false}
            />
            <ValidationMessage msg={error}/>
        </label>
    </fieldset>

}

/**
 * Build datepicker widget using Pikaday module.
 *
 * @public
 * @param value
 */

const DateTimeSelector = ({value}) => {

    // create date state
    const [date, setDate] = React.useState({ date: value ? new Date(value) : new Date() });

    return <Flatpickr
        data-enable-time
        value={date}
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

    // generate unique ID value for input
    const id = Math.random().toString(16).substring(2);

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
                    {options
                        .map(opt =>
                            <option
                                key={`${name}_${opt.name}`}
                                id={`${name}_${opt.name}_${id}`}
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
        },

        attachFile: () => {
            return (
                <>
                    <Button type={'add'} label={`Add ${label}`} onClick={''} />
                    <AttachFile
                        type={"file"}
                        id={id}
                        name={name}
                        onChange={onchange}
                        multiple={false}
                    />
                </>
                )
        }
    }

    // render input
    return _inputElements.hasOwnProperty(type)
        ? _inputElements[type]()
        : <div>Loading error</div>;
}

export default Input;
