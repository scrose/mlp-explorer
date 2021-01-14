/*!
 * MLP.Client.Components.Common.Form
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import validator from '../../utils/validator.utils.client';
import { useMsg } from '../../context/msg.context.client';
import { postData } from '../../services/api.services.client';

/**
 * Build input help text.
 *
 * @public
 * @param error
 */

const ValidationMessage = ({msg}) => {
    return (
        <span className='validation error'>{msg}</span>
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
 */

const inputElements = {
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
                {error ? <ValidationMessage msg={error} /> : null}
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
                {error ? <ValidationMessage msg={error} /> : null}
            </label>
        )
    },
    password: ({name, label}, value, error, {onchange, onblur})  => {
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"password"}
                       id={name} name={name} value={value || ''} onChange={onchange} onBlur={onblur} />
                {error ? <ValidationMessage msg={error} /> : null}
            </label>
        )
    },
    select: ({name, options}, {error, value}, {onchange})  => {
        return( <Select key={`key_${name}`}
                        id={name} name={name} options={options} onChange={onchange} />)
    }
}


/**
 * Form input validation.
 */

const inputValidators = {
    text: (value) => {
        return validator.load(value).isRequired().end();
    },
    checkbox: ()  => {
        return '';
    },
    email: (value) => {
        return validator.load(value).isEmail().end();
    },
    password: (value)  => {
        return validator.load(value).isPassword().end();
    },
    select: ()  => {
        return '';
    }
}

/**
 * Build form selection element.
 *
 * @public
 * @param params
 * @param handler
 */

const Select = ({name, options}, handler) => {
    console.log(name, options)
    const optionElements = options
        .map(key => <option id={key}>{options[key]}</option>);
    return (
        <select name={name} onChange={handler}>
            {optionElements}
        </select>
    )
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

const Fields = ({labels, fields, init, valid, disabled}) => {

    // initialize input values (in state)
    const [values, setValues] = React.useState(init.values);
    // initialize error values (in state)
    const [errors, setErrors] = React.useState(init.errors);

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
     * @param {Object} e
     */

    const handleBlur = e => {
        const { name, value } = e.target;
        const errMsg = inputValidators[name](value);
        e.persist();
        setErrors(errors => ({...errors, [name]: errMsg}));
    }

    const fieldElements =
        fields.map(field => {
            // lookup form input element for data type
            const fieldElement = inputElements[field.render];
            // get current input values in state
            const inputValue = values.hasOwnProperty(field.name)
                ? values[field.name] : '';
            // get current input values in state
            const inputError = errors.hasOwnProperty(field.name)
                ? errors[field.name] : '';
            return fieldElement(field, inputValue, inputError, {onchange: handleChange, onblur: handleBlur});
        })

    return (
        <fieldset name={`fieldset_${labels.name}`} disabled={disabled}>
            <legend>{labels.legend}</legend>
            {fieldElements}
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

const Form = ({ route, props, callback=postData }) => {

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

    // create field value/error initialization states
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
            <Fields
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
