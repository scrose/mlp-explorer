/*!
 * MLP.Client.Components.Common.Fieldset
 * File: fieldset.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Input from './input';

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
                      model,
                      legend,
                      fields,
                      errors,
                      setErrors,
                      data,
                      setData,
                      validators,
                      disabled
}) => {

    const [readonly, setReadonly] = React.useState({});

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const handleChange = e => {
        const { name='', value='', files=[] } = e.target;

        e.persist(); // not used in ReactJS v.17

        // update state with input data
        setData(data => ({...data, [name]: value}));

        // update validation errors
        setErrors(errors => ({
            ...errors,
            [name]: validators[name].check(value || files)
        }));
    }

    // render fieldset component
    return (
        <fieldset
            key={`fset_${model}`}
            name={`fset_${model}`}
            disabled={disabled}
        >
            <legend>{legend}</legend>
            {
                // render form input fields
                Object.keys(fields || {}).map(key => {

                    // get form schema for requested model
                    const { label='', render='', options=[] } = fields[key];
                    const _value = data.hasOwnProperty(key) ? data[key] : '';
                    const _error = errors.hasOwnProperty(key) ? errors[key] : '';
                    const _readonly = readonly.hasOwnProperty(key) ? readonly[key] : false;

                    return (
                        <Input
                            key={`key_${key}`}
                            type={render}
                            name={key}
                            label={label}
                            value={_value}
                            error={_error}
                            options={options}
                            readonly={_readonly}
                            onchange={handleChange}
                        />
                    )
                })
            }
        </fieldset>
    )
}

export default Fieldset;
