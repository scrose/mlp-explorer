/*!
 * MLP.Client.Components.Common.Form
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import validator from '../../utils/validator.utils.client';
import * as api from '../../services/api.services.client';
import { getUserSession, setUserSession } from '../../services/session.services.client'

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
    text: ({name, label}, {error, value}, {onchange, onblur}) => {
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"text"}
                       id={name} name={name} value={value||''} onChange={onchange} onBlur={onblur} />
                {error ? <ValidationMessage msg={error} /> : null}
            </label>
        )
    },
    checkbox: ({name, label}, {error, value}, {onchange})  => {
        const isChecked = (value && value === true);
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"checkbox"}
                       id={name} name={name} checked={isChecked} onChange={onchange} />
            </label>
        )
    },
    email: ({name, label}, {error, value}, {onchange, onblur}) => {
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"email"}
                       id={name} name={name} value={value||''} onChange={onchange} onBlur={onblur} />
                {error ? <ValidationMessage msg={error} /> : null}
            </label>
        )
    },
    password: ({name, label}, {error, value}, {onchange, onblur})  => {
        return(
            <label key={`label_${name}`} htmlFor={name}>
                {label}
                <input key={`key_${name}`} type={"password"}
                       id={name} name={name} value={value||''} onChange={onchange} onBlur={onblur} />
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
    checkbox: (value)  => {
        return '';
    },
    email: (value) => {
        return validator.load(value).isEmail().end();
    },
    password: (value)  => {
        return validator.load(value).isPassword().end();
    },
    select: (value)  => {
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
 * @param name
 * @param legend
 * @param inputs
 * @return fieldset element
 */

const Fields = ({name, legend, inputs}) => {
    return (
        <fieldset name={name}>
            <legend>{legend}</legend>
            {inputs}
        </fieldset>
    )
}

/**
 * Build HTML form.
 *
 * @public
 * @param params
 */

const Form = ({ model, action, legend, inputs, references={}, messages }) => {

    const [refData, setRefData] = React.useState(references);
    const [, setMsgData] = messages;
    const [userData, setUserData] = React.useState(getUserSession());

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Event} e
     */

    const handleChange = e => {
        const { name, value } = e.target;
        const tmp = refData;
        console.log('Ref data:', tmp)
        tmp[name] = {value: value, error:''}
        console.log('New ref data:', tmp)
        setRefData(tmp);
    }

    /**
     * Input on-blur handler. Validates input value(s)
     * and sets first error message in validation chain.
     *
     * @public
     * @param {Event} e
     */

    const handleBlur = e => {
        // const { name, value } = e.target;
        // const errMsg = inputValidators[name](value);
        // const tmp = refData;
        // tmp[name] = {value: value, error:errMsg}
        // console.log('New ref data:', tmp)
        // setRefData(tmp);
    }

    /**
     * Input on-submit handler. Validates form data.
     *
     * @public
     * @param e
     */

    const handleSubmit = e => {
        try {
            const data = new FormData(e.target);
            const jsonData = Object.fromEntries(data.entries());
            const { action } = e.target;

            // stop default form submission
            e.preventDefault();

            // submit form data to API
            api.postData(action, jsonData)
                .then(data => {
                    console.warn('Form submission response:', data)
                    // get response message
                    const { message } = data;
                    setMsgData(message);

                    // Set user session data
                    const { user } = data;
                    if (user) setUserData(user);

                })
                .catch(err => {
                    console.error('Form submission API error:', err)
                    // message.setMsgData({ msg: err, type: 'error' });
                });

        }
        catch (err) {
            console.error(err)
            e.preventDefault();
        }
    }

    // update user session data with state
    React.useEffect(() => {
        console.log('References after:', refData)
        setUserSession(userData);
        }, [userData, refData]);

    const fieldElements =
        inputs.map(field => {
            // lookup form input element from type
            const fieldElement = inputElements[field.type];
            const ref = references.hasOwnProperty(field.name)
                ? references[field.name] : {value: '', error: ''};
            return fieldElement(field, ref, {onchange: handleChange, onblur: handleBlur});
        })

    /**
     * Renders form.
     *
     * @public
     */

    return (
        <form id={model} name={model} method={action.method} onSubmit={handleSubmit}>
            <Fields name={model} legend={legend} inputs={fieldElements} />
            <fieldset>
                <SubmitButton
                    value={action.label}
                    name={`submit_${model}`} />
                <CancelButton url={'/'}/>
            </fieldset>
        </form>
        );
}

export default Form;
