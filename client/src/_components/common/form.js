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
import { genSchema } from '../../_services/schema.services.client';

/**
 * Form submission buttons component.
 *
 * @public
 * @param { model, label }
 */

const Submit = ({model, label, message, cancel}) => {
    const { msg='', type='' } = message || {};
    return (
        <fieldset className={'submit'}>
            <div className={`msg ${type}`}>
                <span>{msg}</span>
            </div>
            <Button
                type={'submit'}
                label={label}
                name={`submit_${model}`} />
            { cancel ?
                <Button
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
                  options=[],
                  callback,
                  cancel=null,
                  route=null
}) => {

    // get form input settings from schema
    const { attributes={}, fieldsets=[] } = schema || {};
    const { submit='Submit', method='POST' } = attributes || {};

    // initialize state for input parameters
    const [data, setData] = React.useState(init);
    const [fieldsetData, setFieldsetData] = React.useState([]);
    const [isDisabled, setDisabled] = React.useState(false);

    React.useEffect(() => {
        if (fieldsetData.length === 0 && fieldsets.length !== 0) {
            setFieldsetData(fieldsets);
        }
    }, [fieldsetData, fieldsets]);

    // create input error states
    const [errors, setErrors] = React.useState({});

    // create error message state
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

    const isValid = () => {
        const hasData = Object.keys(data).length > 0;
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

        // check that form is complete and valid
        if (!isValid()) {
            setMessage({
                    msg: 'Data was not submitted: Form is incomplete or invalid.',
                    type: 'error'
                }
            );
            return;
        }

        // reset validation message
        setMessage({});

        // attempt form submission
        try {

            // convert submitted form data to JSON
            const formData = new FormData(e.target);

            // API callback for form data submission
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
                                    validators={validators}
                                />
                            {
                                fieldset.render === 'multiple'
                                    ? <Button
                                        key={`${index}_copy_button`}
                                        onClick={() => {
                                            // send deep copy of fieldset
                                            handleCopy(fieldset, index);
                                        }}
                                        label={`Add ${fieldset.legend}`}
                                        icon={'add'}
                                    />
                                    : ''
                            }
                            </div>
                        )
                    })
            }
            <Submit
                model={model}
                label={submit}
                message={message}
                cancel={cancel}
            />
        </form>
        );
}

export default Form;
