/*!
 * MLP.Client.Components.Common.Form
 * File: form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Fieldset from './fieldset';
import Button from './button';
import Validator from '../../_utils/validator.utils.client';
import { Submit } from './submit';
import { extractFieldIndex } from '../../_utils/data.utils.client';
import { popSessionMsg } from '../../_services/session.services.client';

/**
 * Build HTML form.
 *
 * @public
 * @param {String} model
 * @param {Object} schema
 * @param {Object} data
 * @param {Function} callback
 */

const Form = ({
                  model,
                  schema,
                  init = {},
                  callback,
                  onChange = () => {},
                  onCancel = null,
                  onReset = null,
                  route = null,
                  opts = null,
                  allowEmpty = false,
                  disabledInputs = {},
                  children,
              }) => {

    // get form input settings from schema
    const { attributes = {}, fieldsets = [] } = schema || {};
    const { submit = '', method = 'POST' } = attributes || {};

    // initialize state for input parameters
    const [data, setData] = React.useState(init || {});
    const [files, setFiles] = React.useState({});
    const [fieldsetSchema, setFieldsetSchema] = React.useState([]);
    const [isDisabled, setDisabled] = React.useState(false);

    // initialize field data
    React.useEffect(() => {
        if (fieldsetSchema.length === 0 && fieldsets.length !== 0) {
            setFieldsetSchema(fieldsets);
        }
    }, [fieldsetSchema, fieldsets]);

    // create input error states / message state
    const [errors, setErrors] = React.useState({});
    const [message, setMessage] = React.useState({});

    // generate unique ID value for form inputs
    const formID = Math.random().toString(16).substring(2);

    /**
     * Generate form data validation handlers.
     *
     * @private
     * @return {Array} validators
     */

    const generateValidators = () => {
        return fieldsetSchema
            .reduce((o, fieldset) => {
                Object.keys(fieldset.fields || {})
                    .map(fieldkey => {
                        const { name = '', validate = [] } = fieldset.fields[fieldkey];
                        o[name] = new Validator(validate);
                        return o;
                    });
                return o;
            }, {});
    };

    // create validator for each input field using schema settings
    let validators = generateValidators();

    /**
     * Form data validation handler. Validates all data inputs.
     *
     * @private
     * @return {boolean} isValid
     */

    const isValid = (formData) => {
        let hasData = allowEmpty;
        let valid = true;
        for (const key in validators) {
            // ensure some data is present
            hasData = hasData || formData[key];
            // check data for validation error
            const err = validators[key].check(data[key] || null);
            valid = err && Object.keys(err).length > 0 ? false : valid;
            // set error state (invokes validation error message)
            setErrors(errors => ({
                ...errors, [key]: err,
            }));
        }
        return hasData && valid;
    };

    /**
     * Form submission handler.
     *
     * @private
     * @param {Event} e
     */

    const handleSubmit = e => {
        e.preventDefault();

        // clear messages
        popSessionMsg();

        // convert submitted form data to JSON
        const formData = new FormData(e.target);

        // convert formData to object
        const fieldData = Object.fromEntries(formData);

        // append files (if they exist)
        // Object.keys(files).forEach(i => {
        //     formData.append(i, files[i][0], files[i][0].name);
        // });

        // check that form is complete and valid
        if (!isValid(fieldData)) {
            setMessage({
                    msg: 'Data was not submitted: Form is incomplete or invalid.',
                    type: 'error',
                },
            );
            return;
        }
        console.log(fieldData, isValid(fieldData))

        // reset validation message
        setMessage({});

        // callback for form data submission
        try {
            return callback(route, formData);
        } catch (err) {
            console.error(callback, err);
        }
    };

    /**
     * Copy fieldset in form.
     *
     * @private
     * @param {Object} fieldset
     * @param index
     */

    const handleCopy = (fieldset, index) => {
        try {

            // make separate copy of the template fieldset
            let fieldsetCopy = JSON.parse(JSON.stringify(fieldset));
            let fieldsets = [...fieldsetSchema];

            // update render type
            fieldsetCopy.render = 'copy';

            // update field keys with updated index
            fieldsetCopy = Object.keys(fieldsetCopy.fields)
                .reduce((o, key) => {
                    const fieldsetIndex = extractFieldIndex(o.fields[key].name);
                    const copiedIndex = `${fieldsetIndex[0]}[${parseInt(fieldsetIndex[1]) + 1}]`;
                    o.fields[key].name = copiedIndex;
                    o.fields[copiedIndex] = o.fields[key];
                    // remove old key
                    delete o.fields[key];
                    return o;
                }, fieldsetCopy);

            // insert new fieldset into state
            fieldsets.splice(index + 1, 0, fieldsetCopy);
            setFieldsetSchema(fieldsets);

            // re-generate validators
            validators = generateValidators();
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Delete fieldset in form.
     *
     * @private
     * @param {Integer} index
     */

    const handleDelete = (index) => {
        try {
            let fieldsets = [...fieldsetSchema];  // make a separate copy of the array
            fieldsets.splice(index, 1);
            setFieldsetSchema(fieldsets);
            validators = generateValidators();
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Render form.
     *
     * @public
     */

    return (
        <form
            id={formID}
            name={model}
            method={method}
            onSubmit={handleSubmit}
            onChange={onChange}
            autoComplete={'chrome-off'}
        >
            {
                fieldsetSchema
                    .map((fieldset, index) => {
                        return (
                            <div key={`fieldset_${index}`}>
                                <Fieldset
                                    formID={formID}
                                    model={model}
                                    index={index}
                                    mode={fieldset.render}
                                    legend={fieldset.legend}
                                    fields={fieldset.fields}
                                    errors={errors}
                                    setErrors={setErrors}
                                    data={data}
                                    files={files}
                                    setFiles={setFiles}
                                    setData={setData}
                                    opts={opts}
                                    remove={() => {
                                        handleDelete(index);
                                    }}
                                    disabled={isDisabled}
                                    disabledInputs={disabledInputs}
                                    validators={validators}
                                />
                                {
                                    fieldset.render === 'multiple'
                                        ? <div className={'addField'}>
                                            <Button
                                                key={`${index}_copy_button`}
                                                onClick={() => {
                                                    // send deep copy of fieldset
                                                    handleCopy(fieldset, index);
                                                }}
                                                label={`Add ${fieldset.legend}`}
                                                icon={'add'}
                                            />
                                        </div>
                                        : ''
                                }
                            </div>
                        );
                    })
            }
            {children}
            <Submit
                model={model}
                label={submit}
                message={message}
                onSubmit={submit}
                onCancel={onCancel}
                onReset={onReset}
            />
        </form>
    );
};

export default Form;
