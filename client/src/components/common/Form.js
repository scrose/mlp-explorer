/*!
 * MLP.Client.Components.Common.Form
 * File: Form.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import validator from '../../utils/validator.utils.client';
import * as api from '../../services/api.services.client';

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
 * @param model
 * @param fields
 * @param legend
 * @param handlers
 * @return fieldset element
 */

const Fields = ({model, inputs, legend, references, handlers}) => {
    const fieldElements =
        inputs.map(field => {
        // lookup form input element from type
        const fieldElement = inputElements[field.type];
        const ref = references.hasOwnProperty(field.name)
            ? references[field.name] : {value: null, error: ''};
        return fieldElement(field, ref, handlers);
    })

    return (
        <fieldset name={model}>
            <legend>{legend}</legend>
            {fieldElements}
        </fieldset>
    )
}

/**
 * Build HTML form.
 *
 * @public
 * @param params
 */

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            references: {}
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // state is updated using fetched data
    componentDidMount() {
        console.log('Did Mount:', this.state)
        // set state to form fields (if not yet loaded)
        if ( !this.state.isLoaded ) {
            const { references={} } = this.props;
            // load state with form fields
            this.setState({ isLoaded: true, references}, () => {
                console.log('State fields:', this.state);
            });
            }
        }

    /**
     * Input on-change handler. Updates state.
     *
     * @public
     * @param {Event} e
     */

    handleChange(e) {
        const { name, value } = e.target;
        const { references } = this.state;
        references[name] = {value: value, error: ''};
        this.setState({references});

    }

    /**
     * Input on-blur handler. Validates input data.
     *
     * @public
     * @param {Event} e
     */

    handleBlur(e) {
        const { name, value } = e.target;
        const { references } = this.state;

        // validate input value(s)
        const errMsg = inputValidators[name](value);
        references[name] = {value: value, error: errMsg};
        this.setState({references});
    }

    /**
     * Input on-submit handler. Validates form data.
     *
     * @public
     * @param e
     */

    handleSubmit(e) {

        const data = new FormData(e.target);
        const jsonData = Object.fromEntries(data.entries());
        const { action } = e.target;

        // get viewer messenger to add API response message
        const { message: [, setMsgData] } = this.props;

        // stop default form submission
        e.preventDefault();

        // submit form data to API
        api.postData(action, jsonData)
            .then(res => {
                setMsgData({ msg: res.response.msg, type: res.response.type });
            })
            .catch(err => {
                console.error('Form submission API error:', err)
                setMsgData({ msg: err, type: 'error' });
            });
    }

    /**
     * Renders form.
     *
     * @public
     */

    render() {
        // get data from parent components
        const { model, action, legend, inputs } = this.props;
        const { references={} } = this.state;
        const handlers = {onchange: this.handleChange, onblur: this.handleBlur};

        return (
            <form id={model} name={model} method={action.method} onSubmit={this.handleSubmit}>
                <Fields
                    model={model}
                    legend={legend}
                    inputs={inputs}
                    references={references}
                    handlers={handlers} />
                <fieldset>
                    <SubmitButton
                        value={action.label}
                        name={`submit_${model}`} />
                    <CancelButton url={'/'}/>
                </fieldset>
            </form>
        )};
}

export default Form;
