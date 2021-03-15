/*!
 * MLP.Client.Components.Common.Fieldset
 * File: fieldset.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Input from './input';
import Button from './button';
import { getNodeLabel } from '../../_services/schema.services.client';

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
                      formID,
                      model,
                      mode,
                      legend,
                      fields,
                      errors,
                      setErrors,
                      data,
                      setData,
                      options,
                      remove,
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
        const {target={}} = e || {};
        const { name='', value='', files=[] } = target;

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
        <>
        <fieldset
            className={legend ? '' : 'hidden'}
            key={`fset_${model}`}
            name={`fset_${model}`}
            disabled={disabled}
        >
            {
                legend ? <legend>{legend}</legend> : ''
            }
            {
                mode==='copy'
                    ? <div className={'removeField'}>
                        <Button
                        key={`fset_${model}_remove`}
                        onClick={remove}
                        label={`Remove ${legend}`}
                        icon={'minus'} />
                    </div>
                    : ''
            }
            {
                // render form input fields
                Object.keys(fields || {}).map(key => {

                    // get form schema for requested model
                    const { id='', label='', render='', name='', reference='' } = fields[key];
                    const _value = data.hasOwnProperty(key) ? data[key] : '';
                    const _error = errors.hasOwnProperty(key) ? errors[key] : '';
                    const _readonly = readonly.hasOwnProperty(key) ? readonly[key] : false;
                    // restructure input options to reference schema
                    const _options = options.hasOwnProperty(id)
                        ? options[id].map(opt => {
                            return {
                                id: opt.id,
                                type: reference,
                                label: getNodeLabel({
                                    metadata: opt,
                                    node: {type: reference}
                                })
                            }
                        })
                        : [];

                    return (
                        <Input
                            key={`key_${key}`}
                            id={formID}
                            type={render}
                            name={name}
                            label={label}
                            value={_value}
                            error={_error}
                            options={_options}
                            readonly={_readonly}
                            onchange={handleChange}
                        />
                    )
                })
            }
        </fieldset>
    </>
    )
}

export default Fieldset;
