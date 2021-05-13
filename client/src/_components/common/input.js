/*!
 * MLP.Client.Components.Common.Input
 * File: input.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import 'flatpickr/dist/themes/material_green.css';
import { convertCoordDMS, sorter } from '../../_utils/data.utils.client';
import Icon from './icon';
import Message, { UserMessage } from './message';
import MultiSelect from './multiselect';
import DateTimeSelector from './datetime';
import Autocomplete from './autocomplete';

/**
 * No operation.
 */

const noop = () => {};

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
                          label = '',
                          value = '',
                          files = [],
                          min = 0,
                          prefix = '',
                          suffix = '',
                          error = null,
                          required = false,
                          readonly = false,
                          multiple = false,
                          disabled = false,
                          ariaLabel = '',
                          options = null,
                          onMultiselect = noop,
                          onChange = noop,
                          onSelect = noop,
                          onDrop = noop,
                          onDragLeave = noop,
                      }) => {

    // input conditional states
    const [autoClick, setAutoClick] = React.useState(true);

    // create event listener for file input
    const fileRef = React.useCallback((domNode) => {
        if (domNode)
            domNode.addEventListener('click', function() {
                if (domNode) {domNode.click() }
            }, false);
    }, []);

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
                type={'hidden'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
            />;
        },

        text: () => {
            return <input
                readOnly={readonly}
                type={'text'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        autocomplete: () => {
            return <Autocomplete
                id={id}
                readOnly={readonly}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        smallText: () => {
            return <input
                readOnly={readonly}
                className={'short'}
                type={'text'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        textarea: () => {
            return <textarea
                    id={id}
                    name={name}
                    readOnly={readonly}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel}
                />;
        },

        checkbox: () => {
            const isChecked = (value && value === true);
            return <input
                    readOnly={readonly}
                    disabled={disabled}
                    type={'checkbox'}
                    id={id}
                    name={name}
                    checked={isChecked}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel}
                />;
        },

        int: () => {
            return <>
                <input
                    readOnly={readonly}
                    disabled={disabled}
                    type={'number'}
                    placeholder={0}
                    step={1}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel} />
            </>;
        },

        float: () => {
            return <>
                <input
                    readOnly={readonly}
                    disabled={disabled}
                    type={'number'}
                    placeholder={0.000}
                    min={min}
                    step={'any'}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel} />
            </>;
        },

        year: () => {
            return <input
                readOnly={readonly}
                disabled={disabled}
                type={'number'}
                placeholder={new Date().getFullYear()}
                min={1800}
                max={new Date().getFullYear()}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        coord: () => {
            return <>
                <input
                    readOnly={readonly}
                    type={'number'}
                    step={'any'}
                    min={name === 'lat' ? -85 : -180}
                    max={name === 'lat' ? 85 : 180}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel} />
                <span>{convertCoordDMS(value)}</span>
            </>;
        },

        date: () => {
            return <DateTimeSelector
                name={name}
                value={value || ''}
                filter={'date'} />;
        },

        datetime: () => {
            return <DateTimeSelector
                name={name}
                value={value || ''}
                filter={'datetime'}
            />;
        },

        time: () => {
            return <DateTimeSelector
                name={name}
                value={value || ''}
                filter={'time'}
            />;
        },

        email: () => {
            return <input
                type={'email'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        password: () => {
            return <input
                readOnly={autoClick}
                type={'password'}
                autoComplete="chrome-off"
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                onClick={() => {
                    setAutoClick(false);
                }}
                onFocus={() => {
                    setAutoClick(false);
                }}
            />;
        },

        select: () => {
            // prepare options data for select input
            const opts = options
                .sort(sorter)
                .map(opt => {
                    const { value = '', label = '' } = opt || {};
                    return <option
                        key={`${id}_${name}_${value}`}
                        id={`${id}_${name}_${value}`}
                        name={`${name}_${value}`}
                        value={value || ''}>{label}</option>;
                });

            return <select
                id={id}
                name={name}
                disabled={disabled || options.length === 0}
                onChange={onChange}
                onSelect={onSelect}
                value={value || ''}
                required={required}
            >
                <option
                    key={`default_${id}_${name}`}
                    id={`default_${id}_${name}`}
                    name={`default_${id}_${name}`}
                    value={''}
                >
                    {label} ...
                </option>
                {opts}
            </select>;
        },

        multiselect: () => {
            return <MultiSelect
                id={id}
                readOnly={readonly}
                name={name}
                selected={value}
                label={label}
                required={required}
                disabled={disabled}
                options={options}
                onChange={onChange}
                onSelect={onMultiselect}
            />;
        },

        file: () => {
            const handleDragEnter = (e) => {
                e.stopPropagation();
                e.preventDefault();
            };
            const handleDragOver = (e) => {
                e.stopPropagation();
                e.preventDefault();
            };
            return <>
                <label
                    key={`label_${name}`}
                    className={'file-upload'}
                    htmlFor={id}
                    onDrop={onDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={onDragLeave}>
                    <input
                        ref={fileRef}
                        type={'file'}
                        id={id}
                        name={name}
                        required={required}
                        onChange={onChange}
                        multiple={multiple}
                    />

                    <Icon type={'import'} />&#160;
                    <span>{multiple ? 'Import Multiple Files' : 'Import File'}</span>
                    <div>{files.join(', ')}</div>
                </label>
            </>;
        },
    };

    // get input element
    const input = _inputElements.hasOwnProperty(type)
        ? _inputElements[type]()
        : <Message message={{msg: 'Loading Error', type: 'error'}} closeable={false} />;

    return type !== 'hidden' && type !== 'file'
        ? <>
            <label key={`label_${name}`} htmlFor={id} className={type}>
                <span className={'label-text'}>{label}</span>
                <span className={'units'}>{prefix}</span>
                {input}
                <span className={'units'}>{suffix}</span>
            </label>
            {<UserMessage message={error} closeable={false} />}
        </>
        : <>
            {input}
            {<UserMessage message={error} closeable={false} />}
        </>;
};

export default Input;
