/*!
 * MLP.Client.Components.Common.Fieldset
 * File: fieldset.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Input from './input';
import Button from './button';
import { useData } from '../../_providers/data.provider.client';

/**
 * Build form fieldset element with inputs. 'Fields' are defined
 * as HTML components containing input elements plus form validation
 * and labels.
 *
 * @public
 * @param params
 * @return fieldset element
 */

const Fieldset = ({
                      formID,
                      model,
                      mode,
                      legend,
                      fields,
                      errors,
                      setErrors,
                      data,
                      setData,
                      files,
                      opts,
                      remove,
                      validators,
                      isDisabled=false,
                      disabledInputs={}
}) => {

    // get local options (if available), otherwise use global options
    const api = useData();
    const optionsData = opts || api.options;

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const _handleChange = e => {
        const { target={} } = e || {};
        const { name='', value='' } = target;
        const attachedFiles = target.files && Object.keys(target.files).length > 0
            ? target.files
            : {};

        // update state with input data
        setData(data => ({...data, [name]: value}));

        // update files (if exist)
        if (Object.keys(attachedFiles).length > 0) {
            setData(data => ({ ...data, [name]: attachedFiles }));
        }

        // update validation errors
        setErrors(errors => ({
            ...errors,
            [name]: validators[name].check(value || attachedFiles)
        }));
    }

    /**
     * Input on-file include handler. Updates references state.
     *
     * @public
     * @param {Array} files
     * @param name
     */

    const _handleFiles = (files, name) => {

        if (!files) return;

        // update files (if exist)
        if (files.length > 0) {
            setData(data => ({ ...data, [name]: files }));
        }

        // update validation errors
        setErrors(errors => ({
            ...errors,
            [name]: validators[name].check(files)
        }));
    }

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param name
     * @param options
     */

    const _handleMultiselect = (name, options) => {

        // update state with input data
        setData(data => ({...data, [name]: options}));

        // update validation errors
        setErrors(errors => ({
            ...errors,
            [name]: validators[name].check(options)
        }));
    }

    // render fieldset component
    return (
        <>
        <fieldset
            className={legend ? '' : 'hidden'}
            key={`fset_${model}`}
            name={`fset_${model}`}
            disabled={isDisabled}
        >
            {
                legend ? <legend>{legend}</legend> : ''
            }
            {
                mode==='copy'
                    ? <div className={'removeField'}>
                        <Button
                        key={`fset_${model}_remove`}
                        onClick={remove}
                        label={`Remove ${legend}`}
                        icon={'minus'} />
                    </div>
                    : ''
            }
            {
                // render form input fields
                Object.keys(fields || {}).map(key => {

                    // get form schema for requested model
                    const { label='', render='', name='', reference='', attributes={}, readonly=false } = fields[key];
                    const _value = data.hasOwnProperty(key) ? data[key] : '';
                    const _error = errors.hasOwnProperty(key) ? errors[key] : '';
                    const _options = optionsData.hasOwnProperty(reference) ? optionsData[reference] : [];
                    const _disabled = disabledInputs.hasOwnProperty(name) ? disabledInputs[name]: false;
                    const _isRequired = validators.hasOwnProperty(name)
                        ? validators[name].validations.includes('isRequired') : false;
                    const _prefix = attributes.hasOwnProperty('prefix') ? attributes.prefix : '';
                    const _suffix = attributes.hasOwnProperty('suffix') ? attributes.suffix : '';
                    const _multiple = attributes.hasOwnProperty('multiple') ? attributes.multiple : '';

                    return (
                        <Input
                            key={`input_${name}_${key}`}
                            id={formID}
                            type={render}
                            name={name}
                            label={label}
                            readonly={readonly}
                            prefix={_prefix}
                            suffix={_suffix}
                            value={_value}
                            required={_isRequired}
                            error={_error}
                            options={_options}
                            multiple={_multiple}
                            disabled={_disabled}
                            onMultiselect={_handleMultiselect}
                            onChange={_handleChange}
                            onFile={_handleFiles}
                        />
                    )
                })
            }
        </fieldset>
    </>
    )
}

export default Fieldset;
