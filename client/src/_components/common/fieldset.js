/*!
 * MLP.Client.Components.Common.Fieldset
 * File: fieldset.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Validator from '../../_utils/validator.utils.client';
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
                      data,
                      setData,
                      valid,
                      disabled}
                  ) => {

    // initialize state for input parameters
    const [errors, setErrors] = React.useState({});
    const [readonly, setReadonly] = React.useState({});

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const isDisabled = e => {
        const { name, value } = e.target;
        e.persist(); // not used in ReactJS v.17
        setData(data => ({...data, [name]: value}));
    }

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const handleChange = e => {
        const { name, value } = e.target;
        e.persist(); // not used in ReactJS v.17
        setData(data => ({...data, [name]: value}));
    }

    /**
     * Input on-blur handler. Validates input value(s)
     * and sets first error message in validation chain.
     *
     * @public
     * @param validator
     */

    const handleBlur = validator => {
        // wrap validator in event handler
        return (e) => {
            const { name, value } = e.target;
            e.persist(); // not used in ReactJS v.17
            setErrors(errors => ({
                ...errors,
                [name]: validator.check(value)
            }));
        }
    }

    // render fieldset component
    return (
        <fieldset key={`fset_${model}`} name={`fset_${model}`} disabled={disabled}>
            <legend>{legend}</legend>
            {
                // insert input fields
                Object.keys(fields || {}).map(key => {

                // get form schema for requested model
                const { name='', label='', render='', refs=[], validate=[], options=[]} = fields[key];
                const _value = (data || []).hasOwnProperty(name) ? data[name] : '';
                const _error = (errors || []).hasOwnProperty(name) ? errors[name] : '';
                const _readonly = (readonly || []).hasOwnProperty(name) ? readonly[name] : false;

                // TODO: Fix references between values in state
                const _references = refs.reduce((o, ref) => {
                    o[ref] = data.hasOwnProperty(ref) ? data[ref] : '';
                    return o;
                }, {});

                // create validator from schema
                const _validator = new Validator(validate, _references);

                return (
                    <Input
                        key={`key_${name}`}
                        type={render}
                        name={name}
                        label={label}
                        value={_value}
                        error={_error}
                        options={options}
                        validate={validate}
                        readonly={_readonly}
                        onchange={handleChange}
                        onblur={handleBlur(_validator)}
                    />
                )

            })}
        </fieldset>
    )
}

export default Fieldset;
