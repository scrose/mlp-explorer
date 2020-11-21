/*!
 * MLP.Core.Views.Builders.Forms
 * File: /views/builders/forms.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

const InputBuilder = require('./input');

/**
 * Module exports.
 * @public
 */

module.exports = FormBuilder;

/**
 * Create Form Builder.
 *
 * @public
 */

function FormBuilder() {
    this.inputBuilder = new InputBuilder();
}

/**
 * Build form DOM from schema.
 *
 * @public
 * @param {Object} params
 */

FormBuilder.prototype.build = function (params) {
    this.schema = {
        form: {
            attributes: {
                action: params.actions.submit.url,
                method: params.method,
                id: params.model.name,
                name: params.model.name
            },
            fieldset: {legend: {textNode: params.legend || params.model.label}}
        }
    };
    let inputs = [];
    let validator = {id: params.model.name, checklist: {}};
    // get user role ID to restrict access to the field
    let role = params.restrict ? ( params.user ? params.user.role_id : 1 ) : 1;
    // create input builder
    let inputBuilder = this.inputBuilder

    // filter renderable and non-restricted fields in schema
    Object.entries(params.model.schema.fields)
        .filter(([key, obj]) => obj.hasOwnProperty('render'))
        .filter(([key, obj]) => obj.render.hasOwnProperty(params.view))
        .filter(([key, obj]) => obj.render[params.view].hasOwnProperty('restrict')
            ? obj.render[params.view].restrict.includes(role)
            : true
        )
        .forEach(([key, obj]) => {
            // select rendering view
            let renderObj = obj.render[params.view];
            // initialize field (<input>) attributes
            renderObj.attributes = renderObj.hasOwnProperty('attributes') ? renderObj.attributes : {};
            // option to use default or custom input type set in schema
            renderObj.attributes.type = renderObj.attributes.hasOwnProperty('type')
                ? renderObj.attributes.type : obj.type;

            // build input built from schema parameters
            inputs.push(
                inputBuilder.build({
                    name: key,
                    attributes: renderObj.attributes,
                    value: obj.hasOwnProperty('value') ? obj.value : '',
                    label: obj.label
                }));

            // add validation checklist (if exists) to validator
            if (renderObj.hasOwnProperty('validation'))
                validator.checklist[key] = {handlers: renderObj.validation, complete: false};

        })

    // initialize buttons wrapped in <div> element
    let buttons = {div:{attributes:{class: 'buttons'}, childNodes:[]}};

    // add submit button
    if (params.actions.hasOwnProperty('submit'))
        buttons.div.childNodes.push(
            inputBuilder.build({
                name: 'submit_' + params.model.name,
                attributes: {type: 'submit'},
                value: params.actions.submit.hasOwnProperty('value')
                    ? params.actions.submit.value : 'Submit',
                label: ''
            }));

    // add cancel button <link>
    if (params.actions.hasOwnProperty('cancel'))
        buttons.div.childNodes.push(
            inputBuilder.build({
                name: 'submit',
                attributes: {
                    type: 'link',
                    url: params.actions.cancel.url,
                    linkText: params.actions.cancel.hasOwnProperty('value')
                        ? params.actions.cancel.value : 'Cancel',
                },
                value: '',
                label: ''
            }));

    // return form and validator schemas
    inputs.push(buttons);
    this.schema.form.fieldset.childNodes = inputs;
    return {form: this.schema, validator: validator};
}

