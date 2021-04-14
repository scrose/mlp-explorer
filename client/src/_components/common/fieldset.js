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
                      setFiles,
                      opts,
                      remove,
                      validators,
                      isDisabled=false,
                      disabledInputs={}
}) => {

    const [readonly, setReadonly] = React.useState({});

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

        const {target={}} = e || {};
        const { name='', value='' } = target;
        const attachedFiles = target.files && Object.keys(target.files).length > 0
            ? target.files
            : {};

        e.persist();

        // update state with input data
        setData(data => ({...data, [name]: value}));

        // update files (if exist)
        if (Object.keys(attachedFiles).length > 0) {
            setFiles(data => ({ ...data, [name]: attachedFiles }));
        }

        // update validation errors
        setErrors(errors => ({
            ...errors,
            [name]: validators[name].check(value || attachedFiles)
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

    /**
     * Drag-and-drop handlers for file inputs. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const _handleDrop = (e) =>{
        e.stopPropagation();
        e.preventDefault();

        const {target={}} = e || {};
        const { name=''} = target;
        const dt = e.dataTransfer;

        setFiles(data => ({ ...data, [name]: dt.files }));
    }
    const _handleDragLeave = (e) =>{
        return;
        e.stopPropagation();
        e.preventDefault();

        const {target={}} = e || {};
        const { name=''} = target;
        const dt = e.dataTransfer;

        setFiles(data => ({ ...data, [name]: dt.files }));
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
                    const { label='', render='', name='', reference='', attributes={} } = fields[key];
                    const _value = data.hasOwnProperty(key) ? data[key] : '';
                    const _files = files.hasOwnProperty(key)
                        ? Object.keys(files[key]).map(fkey => {return files[key][fkey].name})
                        : [];
                    const _error = errors.hasOwnProperty(key) ? errors[key] : '';
                    const _readonly = readonly.hasOwnProperty(key) ? readonly[key] : false;
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
                            prefix={_prefix}
                            suffix={_suffix}
                            value={_value}
                            files={_files}
                            reference={reference}
                            required={_isRequired}
                            error={_error}
                            options={_options}
                            multiple={_multiple}
                            readonly={_readonly}
                            disabled={_disabled}
                            onMultiselect={_handleMultiselect}
                            onChange={_handleChange}
                            onDrop={_handleDrop}
                            onDragLeave={_handleDragLeave}
                        />
                    )
                })
            }
        </fieldset>
    </>
    )
}

export default Fieldset;
