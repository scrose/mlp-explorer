/*!
 * MLP.Client.Components.Common.Form
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import Validator from '../../_utils/validator.utils.client';
import List from './list';

/**
 * Build input help text (error messages).
 *
 * @public
 * @param error
 */

const ValidationMessages = ({msg}) => {
    return (
        <List items={msg} classname={'validation'} />
    )
}

/**
 * Build form cancel button.
 *
 * @public
 * @param id
 */

const CancelButton = ({url, label='Cancel'}) => {
    return (
        <a className={"button"} href={url}>{label}</a>
    )
}

/**
 * Build form submit button.
 *
 * @public
 * @param id
 */

const SubmitButton = ({name, value='Submit'}) => {
    return (
        <input type={"submit"} name={name} value={value} />
    )
}

/**
 * Form input elements.
 *
 * <input type="button">
 * <input type="checkbox">
 * <input type="date">
 * <input type="datetime-local">
 * <input type="email">
 * <input type="file">
 * <input type="hidden">
 * <input type="image">
 * <input type="month">
 * <input type="number">
 * <input type="password">
 * <input type="radio">
 * <input type="reset">
 * <input type="search">
 * <input type="text">
 * <input type="time">
 * <input type="url">
 * <input type="week">
 * <select>
 */

const _inputElements = {
    hidden: ({name, value}) => {
        return(
            <input readOnly={true} key={`key_${name}`} type={"hidden"}
                   id={name} name={name} value={value||''} />
        )
    },
    text: ({name, label}, value, error, {onchange, onblur}) => {
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"text"}
                       id={name} name={name} value={value || ''} onChange={onchange} onBlur={onblur} />
                {error ? <ValidationMessages msg={error} /> : null}
            </label>
        )
    },
    checkbox: ({name, label}, value, error, {onchange})  => {
        const isChecked = (value && value === true);
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"checkbox"}
                       id={name} name={name} checked={isChecked} onChange={onchange} />
            </label>
        )
    },
    email: ({name, label}, value, error, {onchange, onblur}) => {
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"email"}
                       id={name} name={name} value={value || ''} onChange={onchange} onBlur={onblur} />
                {error ? <ValidationMessages msg={error} /> : null}
            </label>
        )
    },
    password: ({name, label}, value, error, {onchange, onblur})  => {
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"password"}
                       id={name} name={name} value={value || ''} onChange={onchange} onBlur={onblur} />
                {error ? <ValidationMessages msg={error} /> : null}
            </label>
        )
    },
    select: ({name, label, options}, value, error, {onchange, onblur})  => {
        return (
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <select key={`key_${name}`} id={name} name={name} onChange={onchange} onBlur={onblur}>
                    {options
                        .map(opt =>
                            <option key={`${name}_${opt.id}`}
                                    id={`${name}_${opt.id}`}
                                    name={`${name}_${opt.id}`}
                                    value={opt.value}>
                                {opt.label}
                            </option>
                        )
                    }
                </select>
                {error ? <ValidationMessages msg={error} /> : null}
            </label>
        )
    }
}

/**
 * Build form fieldset element with inputs. 'Fields' are defined
 * as HTML components containing input elements plus form validation
 * and labels.
 *
 * @public
 * @param params
 * @return fieldset element
 */

const Fieldset = ({labels, fields, init, valid, disabled}) => {

    // initialize input values, errors (in state)
    const [values, setValues] = React.useState(init.values);
    const [errors, setErrors] = React.useState(init.errors);

    /**
     * Handle references between input elements.
     *
     * @public
     * @param {Object} ref
     */

    const handleReference = (ref) => {
        return (elem) => {
            ref = elem;
        }
    }

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const handleChange = e => {
        const { name, value } = e.target;
        e.persist();
        setValues(values => ({...values, [name]: value}));
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
            e.persist();
            setErrors(errors => ({
                ...errors,
                [name]: validator.check(value)
            }));
        }

    }

    // render fieldset component
    return (
        <fieldset key={`fset_${labels.name}`} name={`fset_${labels.name}`} disabled={disabled}>
            <legend>{labels.legend}</legend>
            {fields.map(field => {

                const { name='', render='', refs=[], validate=[] } = field;

                // lookup form input element for data type
                const _fieldElem = _inputElements.hasOwnProperty(render)
                    ? _inputElements[render]
                    : {};

                // get form schema for requested model
                const _value = values.hasOwnProperty(name) ? values[name] : '';
                const _error = errors.hasOwnProperty(name) ? errors[name] : '';
                const _references = refs.reduce((o, ref) => {
                    o[ref] = values.hasOwnProperty(ref) ? values[ref] : '';
                    return o;
                    }, {});

                // create validator from schema
                const _validator = new Validator(validate, _references);

                // render element
                return _fieldElem (
                    field,
                    _value,
                    _error,
                    {
                        onchange: handleChange,
                        onblur: handleBlur(_validator)
                    }
                    );
            })}
            <div>
                <SubmitButton
                    value={labels.submit}
                    name={`submit_${labels.name}`} />
                <CancelButton url={'/'}/>
            </div>
        </fieldset>
    )
}

/**
 * Build HTML form.
 *
 * @public
 * @param { route, params, data, callback }
 */

const Form = ({ route, props, callback }) => {

    console.log('Form params:', props)

    const [isValid, setValid] = React.useState(false);
    const [isDisabled, setDisabled] = React.useState(false);

    // destructure form parameters and data
    const { schema, data, model} = props;
    const { name, fields, attributes } = schema;
    const {legend='', method='POST', submit='Submit'} = attributes;

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
