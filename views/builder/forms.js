/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Views.FormBuilder
  Filename:     views/builder/forms.js
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


// build forms from schema
function buildForm(action, schema, values, widgets) {
    let form = {
        form:
            {
                attributes: {
                    action: action.paths.submit,
                    method: action.method,
                    id: schema.attributes.model,
                    name: schema.attributes.model},
                fieldset: {legend: {textNode: schema.legend}}
            }
    };
    let fields = [];

    // build dom schema
    for (const [key, field] of Object.entries(schema.fields)) {
        const id = key;
        field.attributes.id = id
        field.attributes.name = id

        // create input element and label
        let elem = {input: {attributes: field.attributes}};
        let label = {label: {attributes: {id: 'label_' + id, for: id, class: field.attributes.type}}};

        // check user permissions to access field
        let role = 3;
        if (field.restrict && !field.restrict.includes(role)) {
            continue;
        }

        // check if empty form/field
        const emptyForm = !(values && !utils.data.isEmpty(values));
        const emptyField = emptyForm || !values[key];
        if (emptyField && field.hide_if_empty) continue;

        // handle form input types
        switch (field.attributes.type) {
            case 'ignore':
                continue;
            case 'hidden':
                if (!emptyField) elem.input.attributes.value = values[key];
                fields.push(elem);
                break;
            case 'select':
                if (widgets) {
                    widgets[id].label.childNodes = [{textNode: field.label}];
                    // get widget indexed by fieldname and set selected option
                    if (!emptyField) {
                        widgets[id].select.childNodes.forEach((val) => {
                            if (val.option.attributes.value === values[key]) {
                                val.option.attributes.selected = "selected";
                            }
                        });
                    }
                    fields.push(widgets[id]);
                }
                break;
            case 'checkbox':
                if (!emptyField && values[key] === true) elem.input.attributes.checked = '';
                label.label.childNodes = [elem, {textNode: field.label}];
                fields.push(label);
                break;
            case 'date':
                // handle date values (if given)
                // NOTE Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd)
                if (!emptyField) {
                    elem.input.attributes.value = utils.date.formatDate(
                        values[key], "yyyy-mm-dd"
                    );
                    label.label.textNode = field.label;
                    fields.push(label);
                    fields.push(elem);
                }
                break;
            case 'link':
                field.attributes.href = field.attributes.href || '#';
                const hyperlink = {a: {attributes: field.attributes, textNode: field.text || 'Link'}};
                label.label.childNodes = [{textNode: field.label}];
                fields.push(label, {div: hyperlink});
                break;
            case 'timestamp':
                // handle timestamp values (if given)
                if (!emptyField) {
                    // NOTE Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd HH:mm:ss)
                    const timestamp = {time: {attributes: field.attributes}};
                    label.textNode = field.label;
                    timestamp.time.textNode = values[key] ? utils.date.formatDate(values[key], "yyyy-mm-dd HH:mm:ss") : 'n/a';
                    fields.push(label, {div: timestamp});
                }
                break;
            default:
                if (!emptyField) elem.input.attributes.value = values[key];
                label.label.childNodes = [{textNode: field.label}, elem];
                fields.push(label);
        }
    }
    // add action buttons
    // submit
    fields.push({input: {attributes: {type: 'submit', value: action.name ? action.name : 'submit'}}});
    // cancel
    if (action.cancelURL)
        fields.push({a: {attributes: {class: "form_button", href: action.paths.cancel}, textNode: 'cancel'}});

    // add input fields
    form.form.fieldset.childNodes = fields;
    // return JSON form schema
    // console.log(values, JSON.stringify(form))
    return form;
}


// build select input from schema
exports.select = (id, schema, values) => {
    return buildSelect(id, schema, values);
}

// build forms from schema
exports.create = (action, schema, values, widgets) => {
    return JSON.stringify(buildForm(action, schema, values, widgets));
}

// build login schema from filtered user model schema
exports.login = (action, schema) => {
    let login_schema = {legend: 'User Login', fields: {}};
    login_schema.fields[schema.attributes.username] = schema.fields[schema.attributes.username];
    login_schema.fields[schema.attributes.password] = schema.fields[schema.attributes.password];
    console.log(login_schema)
    let login_form = buildForm(action, login_schema);
    // Add registration
    return JSON.stringify(login_form);
}

// build registration schema from filtered user model schema
exports.registration = (action, schema) => {
    let registration_schema = {
        legend: 'User Registration',
        attributes: schema.attributes,
        fields: {}
    };
    registration_schema.fields[schema.attributes.username] = schema.fields[schema.attributes.username];
    const passwordField = schema.fields[schema.attributes.password];
    passwordField.attributes.type = 'password';
    registration_schema.fields[schema.attributes.password] = passwordField;
    // create repeat password field
    registration_schema.fields['repeat_password'] = {label: 'Repeat Password', attributes: {type: 'password'}};
    // build the registration form
    let registration_form = buildForm(action, registration_schema);
    // Add registration
    return JSON.stringify(registration_form);
}

// build validation object from model schema
exports.validator = (formID, schema) => {
    let validator = {id:formID, fields: {}};
    for (const [key, field] of Object.entries(schema.fields)) {
        validator.fields[key] = field.validation || []
    }
    return JSON.stringify(validator);
}