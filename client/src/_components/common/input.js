/*!
 * MLP.Client.Components.Common.Input
 * File: input.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import Icon from './icon';

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
    return  <div className={'validation tooltip'}>
                <span className={'tooltiptext'}>
                    {msg.length > 0 ? msg[0] : ''}
                </span>
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

export const Input = ({
                          id,
                          type,
                          name,
                          label='',
                          value='',
                          error=null,
                          reference='',
                          readonly=false,
                          disabled=false,
                          ariaLabel='',
                          options=null,
                          onchange=()=>{},
                          onselect=()=>{}
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
            return <input
                    type={"text"}
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                    aria-label={ariaLabel}
                />
        },

        textarea: () => {
            return <textarea
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                    aria-label={ariaLabel}
                />
        },

        checkbox: () => {
            const isChecked = (value && value === true);
            return <input
                    type={'checkbox'}
                    id={id}
                    name={name}
                    checked={isChecked}
                    onChange={onchange}
                    aria-label={ariaLabel}
                />
        },

        date: () => {
            return <DateTimeSelector value={value || ''} />
        },

        email: () => {
            return <input
                    type={"email"}
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={onchange}
                    aria-label={ariaLabel}
                />
        },

        password: () => {
            return <input
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
        },

        select: () => {
            // prepare options data for select input
            let selected = '';
            options = options.map(opt => {
                const {nodes_id='', id=''} = opt || {};
                const optionID = id || nodes_id;

                // the selected option
                if (parseInt(value)===parseInt(optionID)) selected = optionID;

                return {
                    id: optionID,
                    type: reference,
                    value: optionID,
                    label: getNodeLabel({
                        metadata: opt,
                        node: {type: reference}
                    })
                }
            });

            return <select
                    id={id}
                    name={name}
                    disabled={disabled || options.length === 0}
                    onChange={onchange}
                    onSelect={onselect}
                    value={selected}
                >
                    <option
                        key={`default_${id}_${name}`}
                        id={`default_${id}_${name}`}
                        name={`default_${id}_${name}`}
                        value={''}
                    >
                        Select a {getModelLabel(reference)}...
                    </option>
                    {
                        options
                            .map(opt =>
                                <option
                                    key={`${name}_${opt.id}`}
                                    id={`${name}_${opt.id}_${id}`}
                                    name={`${name}_${opt.id}`}
                                    value={opt.value}
                                >
                                    {opt.label}
                                </option>
                            )
                    }
                </select>
        },

        files: () => {
            return <input
                    className={'multiple'}
                    type={"file"}
                    id={id}
                    name={name}
                    onChange={onchange}
                    multiple={true}
                />
        },

        file: () => {
            return <input
                    className={'single'}
                    type={"file"}
                    id={id}
                    name={name}
                    onChange={onchange}
                    multiple={false}
                />
        }
    }

    // get input element
    const input = _inputElements.hasOwnProperty(type)
            ?   <>
                    { error.length > 0 ? <ValidationMessage msg={error}/> : '' }
                    { _inputElements[type]() }
                </>
            : <><Icon type={'error'} />Loading error</>

    return type !== 'hidden'
            ?   <label key={`label_${name}`} htmlFor={id}>
                    {label}
                    {input}
                </label>
            : <>{input}</>;
}

export default Input;
