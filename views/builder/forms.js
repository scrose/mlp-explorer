/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Views.FormBuilder
  Filename:     views/builder/validator.js
  ------------------------------------------------------
  Module to assist in building HTML forms from data
  layer.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 2, 2020
  ======================================================
*/

let utils = require('../../utilities')

// build selection list from schema
function buildSelect(fieldID, schema, values) {
    let selectInput = {
        label: { attributes: {for: fieldID, class: 'select'} },
        select: { attributes: {name: fieldID, id: fieldID} }
    };
    // build dom schema
    const options = [];
    for (const [key, option] of Object.entries(values)) {
        // create option element
        const elem = {
            option: {
                attributes: {
                    value: option[schema.attributes.option.id]
                },
                textNode: option[schema.attributes.option.value]
            }
        };
        options.push(elem);
    }
    selectInput.select.childNodes = options;
    return selectInput;
}

// build validation handler from schema
function buildValidator(view, formID, schema) {
    let validator = {id: formID, checklist: {}};
    for (const [fieldName, fieldObj] of Object.entries(schema.fields)) {
        if (fieldObj.hasOwnProperty('validation')) validator.checklist[fieldName] = {handlers: fieldObj.validation, complete: false};
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
        checkValues: function (field, values) {
            // check if field is empty
            return !values.hasOwnProperty(field);
        },
        build: function (fieldName, fieldAttributes, labelText, values) {
            if (!fieldAttributes.hasOwnProperty('type')) return null;
            this.attributes = fieldAttributes;
            this.handler = (this.hasOwnProperty(this.attributes.type)) ? this[this.attributes.type] : this.default;

            // attach required name + id to attributes
            this.attributes.id = fieldName;
            this.attributes.name = fieldName;
            this.labelText = labelText;
            this.inputLabel = {label: {attributes: {
                        id: 'label_' + fieldName,
                        for: fieldName,
                        class: this.attributes.type
            }}};
            this.value = values && values.hasOwnProperty(fieldName) ? values[fieldName] : '';
            return this.handler();
        },
        // handle form input types
        ignore: function() {return {}},
        hidden: function() {
            if (this.value) this.attributes.value = this.value;
            return {input:{attributes: this.attributes}};
        },
        select: function(elem, values) {
            if (this.widgets.hasOwnProperty(this.attributes.id)) {
                this.widgets[this.attributes.id].label.childNodes = [{textNode: this.params.label}];
                // get widget indexed by fieldname and set selected option
                if (!values.hasOwnProperty(elem.id)) {
                    this.widgets[this.attributes.id].select.childNodes.forEach((val) => {
                        if (val.option.attributes.value === values[this.attributes.id]) {
                            val.option.attributes.selected = "selected";
                        }
                    });
                }
                return this.widgets[this.attributes.id];
            }
        },
        checkbox: function() {
            if (this.value && this.value === true) this.attributes.checked = '';
            this.inputLabel.inputLabel.childNodes = [{input:{attributes: this.attributes}}, {textNode: this.labelText}];
            return this.inputLabel;
        },
        date: function() {
            // handle date values (if given)
            // NOTE: Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd)
            if (this.value) {
                this.attributes.value = utils.date.formatDate(this.value, "yyyy-mm-dd");
                this.inputLabel.label.textNode = field.label;
                return [this.label, {input:{attributes: this.attributes}}];
            }
        },
        link: function() {
            this.attributes.href = this.attributes.href || '#';
            const hyperlink = {a: {attributes: this.attributes, textNode: 'Link Text' || 'Link'}};
            this.inputLabel.label.childNodes = [{textNode: this.labelText}];
            return [this.label, {div: hyperlink}];
        },
        // handle timestamps
        timestamp: function() {
            // NOTE Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd HH:mm:ss)
            const timestamp = {time: {attributes: this.attributes}};
            this.inputLabel.label.textNode = this.labelText;
            timestamp.time.textNode = this.value ? utils.date.formatDate(this.value, "yyyy-mm-dd HH:mm:ss") : 'n/a';
            return [this.label, {div: timestamp}];
        },
        default: function() {
            this.attributes.value = this.value;
            // wrap input in label element
            this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
            return this.inputLabel;
        }
    }
}


// build forms from schema
function buildForm(params, schema, values, widgets) {
    let form = {
        form: {
            attributes: {
                action: params.routes.submit,
                method: params.method,
                id: schema.model,
                name: schema.model},
            fieldset: {legend: {textNode: schema.label}}}
    };
    let inputs = [];

    // create input builder
    let inputBuilder = createInputBuilder(params, widgets);

    // check if form is empty
    const emptyForm = !(values && !utils.data.isEmpty(values));

    // build DOM schema
    for (const [fieldName, field] of Object.entries(schema.fields)) {

        // check if field has view rendering attributes
        if (!field.hasOwnProperty('render')) continue;
        if (!field.render.hasOwnProperty(params.view)) continue;
        let fieldObj = field.render[params.view];
        if (!fieldObj.hasOwnProperty('attributes')) continue;

        // check user permissions to access field
        // TODO: restrict field permissions by user role
        let role = 3;
        if (field.hasOwnProperty('restrict') && !field.restrict.includes(role)) continue;

        // build input element from schema
        inputs.push(inputBuilder.build(fieldName, fieldObj.attributes, field.label, values));

    }
    // submit button
    if (params.routes.submit)
        inputs.push({input: {
            attributes: {
                type: 'submit',
                id: 'submit_' + schema.model,
                value: params.name ? params.name : 'Submit'}
        }});
    // cancel button (link)
    if (params.routes.cancel)
        inputs.push({a: {
            attributes: {
                class: "form_button",
                href: params.routes.cancel
            }, textNode: 'Cancel'}});

    // add input fields
    form.form.fieldset.childNodes = inputs;
    return form;
}


// build select input from schema
exports.select = (id, schema, values) => {
    return buildSelect(id, schema, values);
}

// build forms from schema
exports.create = (params, schema, filter, values, widgets) => {
    return JSON.stringify(buildForm(params, schema, filter, values, widgets));
}

// build validation object from model schema
exports.validator = (view, formID, schema) => {
    return JSON.stringify(buildValidator(view, formID, schema));
}