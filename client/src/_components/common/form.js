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
    const [fieldsetSchema, setFieldsetSchema] = React.useState(fieldsets);
    const [isDisabled, setDisabled] = React.useState(false);

    // create input error states / message state
    const [errors, setErrors] = React.useState({});
    const [message, setMessage] = React.useState({});

    // generate unique ID value for form inputs
    const formID = Math.random().toString(16).substring(2);

    // initialize field data
    React.useEffect(() => {
        if (fieldsetSchema.length === 0 && fieldsets.length !== 0) {
            setFieldsetSchema(fieldsets);
        }
    }, [fieldsetSchema, fieldsets]);

    /**
     * Generate form data validation handlers.
     *
     * @private
     * @return {Array} validators
     */

    const _generateValidators = () => {
        return fieldsetSchema
            .reduce((o, fieldset) => {
                Object.keys(fieldset.fields || {})
                    .forEach(fieldkey => {
                        const { name = '', validate = [] } = fieldset.fields[fieldkey];
                        o[name] = new Validator(validate);
                    });
                return o;
            }, {});
    };

    // create validator for each input field using schema settings
    let validators = _generateValidators();

    /**
     * Form data validation handler. Validates all data inputs.
     *
     * @private
     * @return {boolean} isValid
     */

    const _isValid = (formData) => {
        let hasData = allowEmpty;
        let valid = true;
        for (const key in validators) {
            // ensure some data is present
            hasData = hasData || formData[key];
            // check data for validation error
            const err = validators[key].check(formData[key] || null);
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

    const _handleSubmit = e => {
        e.preventDefault();

        // const test = new FormData(e.target);
        // for( let pair of test.entries() ) {
        //     console.log(pair[0]+ ', '+ pair[1]);
        // }

        // clear messages
        popSessionMsg();

        // check that form is complete and valid
        if (!_isValid(data)) {
            setMessage({
                    msg: 'Data was not submitted: Form is incomplete or invalid.',
                    type: 'error',
                },
            );
            return;
        }

        // reset validation message
        setMessage({});

        // get schema form fields
        // - strip out any copied
        const formFields = (schema.fieldsets || []).reduce((o, fset) => {
            o.push.apply(
                o,
                Object.keys(fset.fields).map(key => {
                    const fieldName = extractFieldIndex(key);
                    return fieldName[0];
                })
            )
            return o;
        }, []);

        // convert data through Form Data API
        // - [1] filter data by form schema
        // - [2] reindex copied fields
        // - [3a] append files
        // - [3b] append metadata
        let formData = new FormData();
        let copyIndex = {};
        Object.keys(data)
            // filter fields not in schema
            .filter(key => {
                // strip out copy key
                const fieldName = extractFieldIndex(key);
                // initialize index for each field
                if (fieldName.length > 1) copyIndex[fieldName[0]] = 0;
                // check if field is in schema
                return formFields.includes(fieldName[0]);
            })
            .forEach(key => {
                // reindex copied fields to sequential order
                const fieldName = extractFieldIndex(key);
                const updatedKey = fieldName.length > 1
                    ? `${fieldName[0]}[${copyIndex[fieldName[0]]++}]`
                    : key;

                // append files
                if (data[key] instanceof FileList) {
                    for (let i = 0 ; i < data[key].length ; i++) {
                        const file = data[key][i];
                        // check file format
                        formData.append(updatedKey, file);
                    }
                }
                // append metadata
                else {
                    // handle composite values (i.e. Arrays)
                    if (Array.isArray(data[key])) {
                        // append each subitem separately
                        data[key].forEach((opt, index) => {
                            formData.append(`${updatedKey}[${index}]`, opt.value || opt || '');
                        })
                    }
                    else {
                        formData.append(updatedKey, data[key] || '');
                    }
                }
        });

        // callback for form data submission
        try {
            return callback(route, formData);
        } catch (err) {
            console.error(callback, err);
        }
    };

    /**
     * Reindex copied fieldset fields by requested copy index.
     * @private
     */

    const _reindexFields = (fields, copyIndex) => {
        return Object.keys(fields).reduce((o, key) => {
            const fieldName = extractFieldIndex(fields[key].name);
            // rewrite the field name with updated copy index
            const updatedKey = `${fieldName[0]}[${copyIndex}]`;
            // update the field with the new name
            // - ensure a deep copy if made of the field object
            o[updatedKey] = JSON.parse(JSON.stringify(fields[key]));
            o[updatedKey].name = updatedKey;
            return o;
        }, {});
    }

    /**
     * Copy fieldset in form.
     *
     * @private
     * @param {Object} fieldset
     */

    const _handleCopy = (fieldset) => {
        try {

            // make separate copy of the template fieldset
            let fieldsetCopy = JSON.parse(JSON.stringify(fieldset));

            // set render type to copy
            fieldsetCopy.render = 'copy';

            // get next copy index based on current number of copies
            const copyIndex = fieldsetSchema.filter(fset => fset.id === fieldset.id).length;

            // update field keys with updated index
            fieldsetCopy.fields = _reindexFields(fieldsetCopy.fields, copyIndex);

            // insert new fieldset into state
            setFieldsetSchema(data => (data.reduce((o, fset, index) => {
                if (index === copyIndex) {
                    o.push(fieldsetCopy)
                }
                o.push(fset);
                return o;
            }, [])));

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

    const _handleDelete = (index) => {
        try {
            // remove fieldset from schema and reindex fields
            setFieldsetSchema(data => (
                data.filter((fset, idx) => idx !== index )));

        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Render form.
     * - Filter fieldsets rendered as forms
     *
     * @public
     */

    return <>
        <form
            id={formID}
            name={model}
            method={method}
            onSubmit={_handleSubmit}
            onChange={onChange}
            autoComplete={'chrome-off'}
        >
            {
                fieldsetSchema
                    .filter(fieldset => fieldset.render !== 'component')
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
                                    setData={setData}
                                    opts={opts}
                                    remove={(e) => {
                                        e.preventDefault();
                                        _handleDelete(index);
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // send deep copy of fieldset
                                                    _handleCopy(fieldset);
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
        {
            fieldsetSchema
                .filter(fieldset => fieldset.render === 'component')
                .map((fieldset, index) => {
                    return (
                        <div key={`fieldset_component_${index}`}>
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
                                setData={setData}
                                opts={opts}
                                disabled={isDisabled}
                                disabledInputs={disabledInputs}
                                validators={validators}
                            />
                        </div>
                    );
                })
        }
    </>;
};

export default Form;
