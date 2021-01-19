/*!
 * MLP.Client.Components.Common.Form
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Fieldset from './fieldset';

/**
 * Build HTML form.
 *
 * @public
 * @param { route, params, data, callback }
 */

const Form = ({ route, schema, callback }) => {

    console.log('Form params:', schema)

    const [isValid, setValid] = React.useState(false);
    const [isDisabled, setDisabled] = React.useState(false);

    // destructure form properties
    const { name='', fields=[], attributes={} } = schema || {};
    const { legend='', method='POST', submit='Submit' } = attributes;

    const handleSubmit = e => {
        e.preventDefault();
        try {
            // convert submitted form data to JSON
            const formData = new FormData(e.target);
            callback(route, Object.fromEntries(formData));
        }
        catch (err) {
            console.error(err)
        }
    }

    // create field value/error/references initialization states
    const initValues = {
        values: fields.reduce((o, f) => {o[f.name] = f.value; return o}, {}),
        errors: fields.reduce((o, f) => {o[f.name] = ''; return o}, {})
    }

    /**
     * Render form.
     *
     * @public
     */

    return (
        <form id={name} name={name} method={method} onSubmit={handleSubmit}>
            <Fieldset
                labels={{name: name, legend: legend, submit: submit}}
                fields={fields}
                init={initValues}
                valid={isValid}
                disabled={isDisabled}
            />
        </form>
        );
}

export default Form;
