/*!
 * MLP.Client.Components.Common.Form
 * File: form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Fieldset from './fieldset';
import Button from './button';
import { addSessionMsg } from '../../_services/session.services.client';
import { genSchema, getModelLabel } from '../../_services/schema.services.client';
import { useRouter } from '../../_providers/router.provider.client';
import { useData } from '../../_providers/data.provider.client';

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
 * @param {String} view
 * @param {String} model
 * @param {Object} data
 * @param {Function} setData
 * @param {Function} callback
 */

const Form = ({
                  view,
                  model,
                  data,
                  callback
}) => {

    const api = useRouter();
    const msg = useData();

    const [isValid, setValid] = React.useState(false);
    const [isDisabled, setDisabled] = React.useState(false);

    // get settings from schema
    const { attributes={}, fields=[] } = genSchema(view, model) || {};
    const {
        submit='Submit',
        method='POST',
        legend='User Form'
    } = attributes || {};

    const handleSubmit = e => {
        e.preventDefault();
        try {
            // convert submitted form data to JSON
            const formData = new FormData(e.target);

            // API callback for form data submission
            callback(api.route, Object.fromEntries(formData))
                .then(res => {
                    msg.setMessage(res.message);
                    api.followup(res);
                })
                .catch(err => console.error(err))
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
                init={data}
                valid={isValid}
                disabled={isDisabled}
            />
            <Submit model={model} label={submit} />
        </form>
        );
}

export default Form;
