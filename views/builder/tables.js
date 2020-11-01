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
        // build input field from schema
        build: function (fieldName, fieldAttributes, labelText, values) {

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
            this.inputValues = values || {};
            this.value = values && values.hasOwnProperty(fieldName) ? values[fieldName] : '';
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
                return [this.label, {input:{attributes: this.attributes}}];
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
        // handle timestamps
        timestamp: function() {
            // NOTE Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd HH:mm:ss)
            const timestamp = {time: {attributes: this.attributes}};
            this.inputLabel.label.textNode = this.labelText;
            timestamp.time.textNode = this.value ? utils.date.formatDate(this.value, "yyyy-mm-dd HH:mm:ss") : 'n/a';
            return [this.label, {div: timestamp}];
        },
        password: function() {
            this.attributes.value = this.value;
            // wrap input in label element
            this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
            return [this.inputLabel];
        },
        repeat_password: function() {
            // load current password value (if exists)
            const password = (this.inputValues) ? this.inputValues[this.attributes.repeat] : '';
            // wrap input in label element
            this.inputLabel.label.childNodes = [
                {textNode: this.labelText},
                {input:{attributes: {type: 'password', id: 'repeat_password', name: 'repeat_password', value: password}}}
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
function buildTable(params, schema, values, widgets) {
    let form = {
        table: {
            attributes: {
                id: schema.model,
                class: 'table'},
            thead: {th: {textNode: schema.label}}
        }
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

        fieldObj.attributes = fieldObj.hasOwnProperty('attributes') ? fieldObj.attributes : {};
        // option to use default or custom input type set in schema
        fieldObj.attributes.type = (fieldObj.attributes.hasOwnProperty('type')) ? fieldObj.attributes.type : field.type;

        // check user permissions to access field
        // TODO: restrict field permissions by user role
        let role = 3;
        if (field.hasOwnProperty('restrict') && !field.restrict.includes(role)) continue;

        // build input element from schema
        inputBuilder.build(fieldName, fieldObj.attributes, field.label, values).forEach((elem) => {inputs.push(elem)});

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

// build form + validator schemas from model schema + data
exports.create = (params, schema, values, widgets) => {
    return {
        form: JSON.stringify(buildForm(params, schema, values, widgets)),
        validator: JSON.stringify(buildValidator(params.view, schema.model, schema))
    };
}

// build validation object from model schema
exports.validator = (view, formID, schema) => {
    return JSON.stringify(buildValidator(view, formID, schema));
}