/*!
 * MLP.Client.Components.Common.Form
 * File: form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Fieldset from './fieldset';
import Button from './button';
import { getModelLabel } from '../../_services/schema.services.client';
import { useRouter } from '../../_providers/router.provider.client';
import { useData } from '../../_providers/data.provider.client';
import Validator from '../../_utils/validator.utils.client';

/**
 * Form submission buttons component.
 *
 * @public
 * @param { model, label }
 */

const Submit = ({model, label}) => {
    return (
        <fieldset className={'submit'}>
            <Button
                type={'submit'}
                label={label}
                name={`submit_${model}`} />
            <Button
                type={'cancel'}
                label={'Cancel'}
                name={`cancel_${model}`}
                url={'/'} />
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
                  callback
}) => {

    const router = useRouter();
    const api = useData();

    // initialize state for input parameters
    const [data, setData] = React.useState(init);
    const [isDisabled, setDisabled] = React.useState(false);

    // create input error states
    const [errors, setErrors] = React.useState({});

    // get form input settings from schema
    const { attributes={}, fields=[] } = schema || {};
    const {
        submit='Submit',
        method='POST',
        legend='User Form' } = attributes || {};

    // create validator for each input using schema settings
    const validators = Object.keys(fields || {})
        .reduce((o, key) => {
            const { validate=[] } = fields[key];
            o[key] = new Validator(validate);
            return o;
        }, {});

    /**
     * Form data validation handler. Validates all data inputs.
     *
     * @private
     * @return {boolean} isValid
     */

    const isValid = () => {
        const hasData = Object.keys(data).length > 0;
        const validationErrors = Object.keys(validators)
            .filter(key => {
                const err = validators[key].check(data[key] || null);
                setErrors(errors => ({
                    ...errors, [key]: err
                }));
            });
        return hasData && validationErrors.length === 0;
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
            api.setMessage(
                { msg: 'Form is incomplete or invalid.', type: 'error' }
            );
        }

        // attempt form submission
        try {

            // convert submitted form data to JSON
            const formData = new FormData(e.target);

            // API callback for form data submission
            return callback(router.route, formData)
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
            id={model}
            name={model}
            method={method}
            onSubmit={handleSubmit}
            autoComplete={'chrome-off'}
        >
            <Fieldset
                model={model}
                legend={`${legend} ${getModelLabel(model)}`}
                fields={fields}
                errors={errors}
                setErrors={setErrors}
                data={data}
                setData={setData}
                init={data}
                disabled={isDisabled}
                validators={validators}
            />
            <Submit model={model} label={submit} />
        </form>
        );
}

export default Form;
