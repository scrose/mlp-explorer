/*!
 * MLP.Client.Components.Common.Form
 * File: form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Fieldset from './fieldset';
import Button from './button';
import Validator from '../../_utils/validator.utils.client';
import { useData } from '../../_providers/data.provider.client';

/**
 * Form submission buttons component.
 *
 * @public
 * @param { model, label }
 */

const Submit = ({model, label='', message, cancel, reset, submit=true}) => {
    const { msg='', type='' } = message || {};
    return (
        <fieldset className={'submit'}>
            { msg ?
                <div className={`msg ${type}`}>
                    <span>{msg}</span>
                </div>
                : ''
            }
            { submit ?
                <Button
                    className={'submit'}
                    type={'submit'}
                    label={label || 'Submit'}
                    name={`submit_${model}`}
                /> : ''
            }
            { reset ?
                <Button
                    type={'reset'}
                    label={'Reset'}
                    name={`reset_${model}`}
                    onClick={reset}
                /> : ''
            }
            { cancel ?
                <Button
                    className={'cancel'}
                    type={'cancel'}
                    label={'Cancel'}
                    name={`cancel_${model}`}
                    onClick={cancel}
                /> : ''
            }
        </fieldset>

    );
}

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
                  init={},
                  opts=null,
                  callback,
                  onChange=()=>{},
                  cancel=null,
                  reset=null,
                  route=null,
                  disabledInputs={},
                  children
}) => {

    // get form input settings from schema
    const { attributes={}, fieldsets=[] } = schema || {};
    const { submit='', method='POST' } = attributes || {};

    // get global field options
    const api = useData();
    const { options={} } = opts || api || {};

    // initialize state for input parameters
    const [data, setData] = React.useState(init);
    const [fieldsetData, setFieldsetData] = React.useState([]);
    const [isDisabled, setDisabled] = React.useState(false);

    // initialize field data
    React.useEffect(() => {
        if (fieldsetData.length === 0 && fieldsets.length !== 0) {
            setFieldsetData(fieldsets);
        }
    }, [fieldsetData, fieldsets]);

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
        return fieldsetData
            .reduce((o, fieldset) => {
                Object.keys(fieldset.fields || {})
                    .map(fieldkey => {
                        const { name='', validate = [] } = fieldset.fields[fieldkey];
                        o[name] = new Validator(validate);
                        return o;
                    });
                return o;
            }, {});
    }

    // create validator for each input field using schema settings
    let validators = generateValidators();

    /**
     * Form data validation handler. Validates all data inputs.
     *
     * @private
     * @return {boolean} isValid
     */

    const isValid = (formData) => {
        const hasData = Object.keys(formData).length > 0;
        let valid = true;
        for (const key in validators) {
            const err = validators[key].check(data[key] || null);
            valid = err.length > 0 ? false : valid;
            setErrors(errors => ({
                ...errors, [key]: err,
            }));
        }
        return hasData && valid;
    }

    /**
     * Form submission handler.
     *
     * @private
     * @param {Event} e
     */

    const handleSubmit = e => {
        e.preventDefault();

        // convert submitted form data to JSON
        const formData = new FormData(e.target);
        const fieldData = Object.fromEntries(formData);

        // check that form is complete and valid
        if (!isValid(fieldData)) {
            setMessage({
                    msg: 'Data was not submitted: Form is incomplete or invalid.',
                    type: 'error'
                }
            );
            return;
        }

        // reset validation message
        setMessage({});

        // callback for form data submission
        try {
            return callback(route, formData);
        }
        catch (err) {
            console.error(callback, err)
        }
    }

    /**
     * Copy fieldset in form.
     *
     * @private
     * @param {Object} fieldset
     * @param {Integer} index
     */

    const handleCopy = (fieldset, index) => {
        try {

            // make a separate copies of the full fieldset arrays
            let fieldsetCopy = JSON.parse(JSON.stringify(fieldset));
            let fieldsets = [...fieldsetData];

            // update render state
            fieldsetCopy.render = 'copy';

            // update field keys with index
            fieldsetCopy = Object.keys(fieldsetCopy.fields)
                .reduce((o, key) => {
                    o.fields[key].name = `${o.fields[key].id}[${index + 1}]`;
                    return o;
                }, fieldsetCopy);

            // insert new fieldset into state
            fieldsets.splice(index + 1, 0, fieldsetCopy);
            setFieldsetData(fieldsets);

            // re-generate validators
            validators = generateValidators();
        }
        catch (err) {
            console.error(err)
        }
    }

    /**
     * Delete fieldset in form.
     *
     * @private
     * @param {Integer} index
     */

    const handleDelete = (index) => {
        try {
            let fieldsets = [...fieldsetData]  ;  // make a separate copy of the array
            fieldsets.splice(index, 1);
            setFieldsetData(fieldsets);
            validators = generateValidators();
        }
        catch (err) {
            console.error(err)
        }
    }

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
                fieldsetData
                    .map((fieldset, index) => {
                        return (
                            <div key={index}>
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
                                    options={options}
                                    remove={()=>{handleDelete(index)}}
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
                        )
                    })
            }
            {children}
            <Submit
                model={model}
                label={submit}
                message={message}
                submit={submit}
                cancel={cancel}
                reset={reset}
            />
        </form>
        );
}

export default Form;
