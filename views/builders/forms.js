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

let utils = require('../../_utilities')

/**
 * Build input selection list from schema
 *
 * @public
 * @param id
 * @param schema
 * @param data
 */

function buildSelect(id, schema, data) {
    if (!schema.hasOwnProperty(id)) return;

    let selectInput = {
        label: { attributes: {for: id} },
        select: { attributes: {name: id, id: id} }
    };
    // get input select option field name
    let optionField = schema[id].render.select.option;

    // build select options schema
    selectInput.select.childNodes = [];
    Object.entries(data).forEach(([key, item]) => {
        // create option element
        selectInput.select.childNodes.push({
            option: {
                attributes: { value: item[id] },
                textNode: item[optionField]
            }
        })
    });
    return selectInput;
}

/**
 * Build handler mapping for validation schema
 *
 * @public
 * @param {String} view
 * @param {Object} model
 */

function Validator(view, model) {
    let validator = {id: model.name, checklist: {}};
    for (const [fieldName, field] of Object.entries(model.schema)) {
        // check if field has view rendering a validation schema
        if (!field.hasOwnProperty('render')) continue;
        if (!field.render.hasOwnProperty(view)) continue;
        let fieldObj = field.render[view];
        if (!fieldObj.hasOwnProperty('validation')) continue;
        validator.checklist[fieldName] = {handlers: fieldObj.validation, complete: false};
    }
    return validator;
}

/**
 * Create Input Builder.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 */

function InputBuilder(params, widgets) {
    this.params = params;
    this.widgets = widgets;
    this.attributes = {};
    this.inputLabel = {};
    this.labelText = '';
    this.handler = null;
    this.value = false;
}

/**
 * Build input DOM from parameters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.build = function (params) {

            // attach required name + id to attributes
            this.attributes = params.attributes;
            this.attributes.id = params.;
            this.attributes.name = fieldName;
            this.labelText = labelText;
            this.inputLabel = {label: {attributes: {
                        id: 'label_' + params.name,
                        for: params.name,
                        class: this.attributes.type
            }}};
            this.value = params.value ? params.value : '';
            this.handler = (this.hasOwnProperty(params.attributes.type)) ? this[params.attributes.type] : this.default;
            return this.handler();
        }

        // handle form input types
/**
 * Ignore input.
 *
 * @public
 */

InputBuilder.prototype.ignore = function() {
    return {}
}

/**
 * Build hidden input.
 *
 * @public
 */

InputBuilder.prototype.hidden = function() {
            if (this.value) this.attributes.value = this.value;
            return [{input:{attributes: this.attributes}}];
        }
/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.select = function() {
            if (this.widgets.hasOwnProperty(this.attributes.id)) {
                this.widgets[this.attributes.id].label.childNodes = [{textNode: this.labelText}];
                // get widget indexed by fieldname and set selected option
                this.widgets[this.attributes.id].select.childNodes.forEach((val) => {
                    if (val.option.attributes.value === this.value) {
                        val.option.attributes.selected = "selected";
                    }
                });
                return [this.widgets[this.attributes.id]];
            }
        }
/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.checkbox = function() {
            if (this.value && this.value === true) this.attributes.checked = '';
            this.inputLabel.inputLabel.childNodes = [{input:{attributes: this.attributes}}, {textNode: this.labelText}];
            return [this.inputLabel];
        }

/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.date = function() {
            // handle date values (if given)
            // NOTE: Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd)
            if (this.value) {
                this.attributes.value = utils.date.formatDate(this.value, "yyyy-mm-dd");
                this.inputLabel.label.textNode = field.label;
                return [this.inputLabel, {input:{attributes: this.attributes}}];
            }
        }

/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.link = function() {
            let url = this.attributes.url || '#';
            let className = this.attributes.class || 'form_button';
            let target = this.attributes.target || '_self';
            const hyperlink = {a: {
                attributes: {href: url, class: className, target: target},
                textNode: this.attributes.linkText || this.attributes.url}
            };
            this.inputLabel.label.childNodes = [{textNode: this.labelText}];
            return [this.inputLabel, {div: hyperlink}];
        }
        // handle simple inline text
/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.textNode = function() {
            const tnode = {div: {attributes: this.attributes, p: {textNode:this.value }}};
            this.inputLabel.label.textNode = this.labelText;
            return [this.inputLabel, tnode];
        }
        // handle timestamps

/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.timestamp = function() {
            // NOTE Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd HH:mm:ss)
            const timestamp = {time: {attributes: this.attributes}};
            this.inputLabel.label.textNode = this.labelText;
            timestamp.time.textNode = this.value ? utils.date.formatDate(this.value, "yyyy-mm-dd HH:mm:ss") : 'n/a';
            return [this.inputLabel, {div: timestamp}];
        },
/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.build = password: function() {
            this.attributes.value = this.value;
            // wrap input in label element
            this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
            return [this.inputLabel];
        },
/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.build = repeat_password: function() {
            // wrap input in label element
            this.inputLabel.label.childNodes = [
                {textNode: this.labelText},
                {input:{attributes: {type: 'password', id: 'repeat_password', name: 'repeat_password', value: this.value}}}
                ];
            return [this.inputLabel];
        },
/**
 * Build input from paramters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 */

InputBuilder.prototype.build = default: function() {
            this.attributes.value = this.value;
            // wrap input in label element
            this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
            return [this.inputLabel];
        }
    }
}

/**
 * Create Form element from schema.
 *
 * @public
 * @param {Object} params
 * @param {Object} schema
 * @param {Object} widgets
 */

function FormBuilder(params, schema, widgets) {
    this.form = {
        form: {
            attributes: {
                action: params.routes.submit,
                method: params.method,
                id: params.id,
                name: params.id
            },
            fieldset: {legend: {textNode: params.legend || schema.model}}
        }
    };
    this.inputs = [];

    // create input builders
    this.inputBuilder = InputBuilder(params, widgets);
}

/**
 * Build form DOM from schema.
 *
 * @public
 * @param {Object} params
 * @param {Object} schema
 * @param {Object} widgets
 */

FormBuilder.prototype.build = function () {

    // build DOM schema
    for (const [fieldName, field] of Object.entries(schema.schema)) {

        // check if field has view rendering attributes
        if (!field.hasOwnProperty('render')) continue;
        if (!field.render.hasOwnProperty(params.view)) continue;
        let fieldValue = (field.hasOwnProperty('value')) ? field.value : '';
        let fieldObj = field.render[params.view];

        // initialize field (<input>) attributes
        fieldObj.attributes = fieldObj.hasOwnProperty('attributes') ? fieldObj.attributes : {};
        // option to use default or custom input type set in schema
        fieldObj.attributes.type = (fieldObj.attributes.hasOwnProperty('type')) ? fieldObj.attributes.type : field.type;

        // check user permissions to access field
        // TODO: restrict field permissions by user role
        let role = 3;
        if (field.hasOwnProperty('restrict') && !field.restrict.includes(role)) continue;

        // build input element from schema
        let args = {
            name: fieldName,
            attributes: fieldObj.attributes,
            value: fieldValue,
            label: field.label
        }
        inputBuilder.build(args).forEach((elem) => {inputs.push(elem)});

    }
    // submit button
    let actionButtons = {div:{attributes:{class: 'submit'}, childNodes:[]}};
    if (params.routes.submit)
        actionButtons.div.childNodes.push({input: {
            attributes: {
                type: 'submit',
                id: 'submit_' + schema.model,
                value: params.submitValue ? params.submitValue : 'Submit'}
        }});
    // cancel button (link)
    if (params.routes.cancel)
        actionButtons.div.childNodes.push({a: {
            attributes: {
                class: "form_button",
                href: params.routes.cancel
            }, textNode: 'Cancel'}});
    inputs.push(actionButtons);

    // add all input fields to form
    form.form.fieldset.childNodes = inputs;
    return form;
}


// build select input from schema
exports.select = (id, schema, values) => {
    return buildSelect(id, schema, values);
}

// build form + validator schemas from model schema (w/ data)
exports.create = (params, model, widgets) => {
    return {
        form: JSON.stringify(buildForm(params, model, widgets)),
        validator: JSON.stringify(buildValidator(params.view, model))
    };
}

// build validation object from model schema
exports.validator = (view, model) => {
    return JSON.stringify(buildValidator(view, model));
}