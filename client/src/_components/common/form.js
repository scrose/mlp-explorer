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

/**
 * Build HTML form.
 *
 * @public
 * @param { route, params, data, callback }
 */

const Form = ({
                  action,
                  model,
                  method,
                  legend,
                  submit,
                  fields,
                  data,
                  setData,
                  callback
}) => {

    const [isValid, setValid] = React.useState(false);
    const [isDisabled, setDisabled] = React.useState(false);

    const handleSubmit = e => {
        e.preventDefault();
        try {
            // convert submitted form data to JSON
            const formData = new FormData(e.target);

            // API callback for form data submission
            callback(action, Object.fromEntries(formData))
                .then(res => {
                    console.log('Form response:', res);
                    addSessionMsg(res.message)
                })
                .catch(err => console.error(err))
                // .then(res => {
                //     if (review) {
                //         addSessionMsg(res.message);
                //         // TODO: create redirection after edits/additions
                //         // redirect(getNodeURI(model, review, nodes_id));
                //     }
                // });
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
            <fieldset className={'submit'}>
                <Button
                    type={'submit'}
                    label={submit}
                    name={`submit_${model}`} />
                <Button
                    type={'cancel'}
                    label={'Cancel'}
                    name={`cancel_${model}`}
                    url={'/'} />
            </fieldset>
            <Fieldset
                model={model}
                legend={legend}
                fields={fields}
                data={data}
                setData={setData}
                valid={isValid}
                disabled={isDisabled}
            />
        </form>
        );
}

export default Form;
