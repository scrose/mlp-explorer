/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Views.Builder.Forms
  Filename:     views/builder/forms.js
  ------------------------------------------------------
  Module to assist in building HTML forms from using
  data model schema
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 2, 2020
  ======================================================
*/

'use strict'

let utils = require('../../_utilities')

// build selection list from schema
function buildSelect(fieldID, schema, data) {
    let selectInput = {
        label: { attributes: {for: fieldID} },
        select: { attributes: {name: fieldID, id: fieldID} }
    };
    // get option/value indexes
    let optionField, valueField;
    // build DOM schema
    for (const [fieldName, field] of Object.entries(schema)) {

        // check if field has view rendering attributes
        if (!field.hasOwnProperty('render')) continue;
        if (!field.render.hasOwnProperty('select')) continue;
        optionField = field.render.select.option;
        valueField = field.render.select.value;
    }
    // build select options schema
    const options = [];
    for (const [key, item] of Object.entries(data)) {
        // create option element
        const elem = {
            option: {
                attributes: {
                    value: item[valueField]
                },
                textNode: item[optionField]
            }
        };
        options.push(elem);
    }
    selectInput.select.childNodes = options;
    return selectInput;
}

// build handler mapping for validation schema
function buildValidator(view, model) {
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

function createInputBuilder(formParams, formWidgets) {
    return {
        // class properties
        params: formParams,
        widgets: formWidgets,
        attributes: {},
        inputLabel: {},
        labelText: '',
        handler: null,
        value: false,
        // checkValues: function (field, values) {
        //     // check if field is empty
        //     return !values.hasOwnProperty(field);
        // },
        // build input field from schema
        build: function (fieldName, fieldAttributes, fieldValue, labelText) {

            // attach required name + id to attributes
            this.attributes = fieldAttributes;
            this.attributes.id = fieldName;
            this.attributes.name = fieldName;
            this.labelText = labelText;
            this.inputLabel = {label: {attributes: {
                        id: 'label_' + fieldName,
                        for: fieldName,
                        class: this.attributes.type
            }}};
            this.value = fieldValue ? fieldValue : '';
            this.handler = (this.hasOwnProperty(this.attributes.type)) ? this[this.attributes.type] : this.default;
            return this.handler();
        },
        // handle form input types
        ignore: function() {return {}},
        hidden: function() {
            if (this.value) this.attributes.value = this.value;
            return [{input:{attributes: this.attributes}}];
        },
        select: function() {
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
        },
        checkbox: function() {
            if (this.value && this.value === true) this.attributes.checked = '';
            this.inputLabel.inputLabel.childNodes = [{input:{attributes: this.attributes}}, {textNode: this.labelText}];
            return [this.inputLabel];
        },
        date: function() {
            // handle date values (if given)
            // NOTE: Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd)
            if (this.value) {
                this.attributes.value = utils.date.formatDate(this.value, "yyyy-mm-dd");
                this.inputLabel.label.textNode = field.label;
                return [this.inputLabel, {input:{attributes: this.attributes}}];
            }
        },
        link: function() {
            let url = this.attributes.url || '#';
            let className = this.attributes.class || 'form_button';
            let target = this.attributes.target || '_self';
            const hyperlink = {a: {
                attributes: {href: url, class: className, target: target},
                textNode: this.attributes.linkText || this.attributes.url}
            };
            this.inputLabel.label.childNodes = [{textNode: this.labelText}];
            return [this.inputLabel, {div: hyperlink}];
        },
        // handle simple inline text
        textNode: function() {
            const tnode = {div: {attributes: this.attributes, p: {textNode:this.value }}};
            this.inputLabel.label.textNode = this.labelText;
            return [this.inputLabel, tnode];
        },
        // handle timestamps
        timestamp: function() {
            // NOTE Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd HH:mm:ss)
            const timestamp = {time: {attributes: this.attributes}};
            this.inputLabel.label.textNode = this.labelText;
            timestamp.time.textNode = this.value ? utils.date.formatDate(this.value, "yyyy-mm-dd HH:mm:ss") : 'n/a';
            return [this.inputLabel, {div: timestamp}];
        },
        password: function() {
            this.attributes.value = this.value;
            // wrap input in label element
            this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
            return [this.inputLabel];
        },
        repeat_password: function() {
            // wrap input in label element
            this.inputLabel.label.childNodes = [
                {textNode: this.labelText},
                {input:{attributes: {type: 'password', id: 'repeat_password', name: 'repeat_password', value: this.value}}}
                ];
            return [this.inputLabel];
        },
        default: function() {
            this.attributes.value = this.value;
            // wrap input in label element
            this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
            return [this.inputLabel];
        }
    }
}


// build forms from schema
function buildForm(params, schema, widgets) {
    let form = {
        form: {
            attributes: {
                action: params.routes.submit,
                method: params.method,
                id: schema.model,
                name: schema.model},
            fieldset: {legend: {textNode: schema.legend}}
        }
    };
    let inputs = [];

    // create input builder
    let inputBuilder = createInputBuilder(params, widgets);

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
        inputBuilder.build(fieldName, fieldObj.attributes, fieldValue, field.label).forEach((elem) => {inputs.push(elem)});

    }
    // submit button
    let actionButtons = {div:{attributes:{class: 'submit'}, childNodes:[]}};
    if (params.routes.submit)
        actionButtons.div.childNodes.push({input: {
            attributes: {
                type: 'submit',
                id: 'submit_' + schema.model,
                value: params.name ? params.name : 'Submit'}
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