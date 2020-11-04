/*!
 * MLP.Core.Views.Builders.Input
 * File: /views/builders/forms.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

let utils = require('../../_utilities');

/**
 * Module exports.
 * @public
 */

module.exports = InputBuilder;

/**
 * Create Input Builder. Enables creation of input HTML elements.
 *
 * @public
 */

function InputBuilder() {}

/**
 * Build input element schema from parameters.
 *
 * @public
 * @param {Object} params
 * @param {Object} widgets
 * @param {Object} params
 * @param {Object} widgets
 * @return {Object} input schema
 */

InputBuilder.prototype.build = function (params) {
    this.attributes = params.attributes;
    this.attributes.id = params.name;
    this.attributes.name = params.name;
    this.labelText = params.label;
    this.inputLabel = {
        label: {attributes: {id: 'label_' + params.name, for: params.name}}
    };
    this.value = params.value ? params.value : '';
    // select input type builder
    return this.hasOwnProperty(params.attributes.type) ? this[params.attributes.type] : this.default;
}

/**
 * Ignore input.
 *
 * @public
 */

InputBuilder.prototype.ignore = function() { return {}; }

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
 * Build select input from available widgets.
 *
 * @public
 */

InputBuilder.prototype.select = function() {
    if (this.widgets.hasOwnProperty(this.attributes.id)) {
        this.widgets[this.attributes.id].label.childNodes = [{textNode: this.labelText}];
        // get widget indexed by field name and set selected option
        this.widgets[this.attributes.id].select.childNodes.forEach((val) => {
            if (val.option.attributes.value === this.value) {
                val.option.attributes.selected = "selected";
            }
        });
        return [this.widgets[this.attributes.id]];
    }
}

/**
 * Build input selection list from schema
 *
 * @public
 * @param id
 * @param schema
 * @param data
 */

InputBuilder.prototype.select = function (id, schema, data) {
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
 * Build checkbox input.
 *
 * @public
 */

InputBuilder.prototype.checkbox = function() {
    if (this.value && this.value === true) this.attributes.checked = '';
    this.inputLabel.inputLabel.childNodes = [{input:{attributes: this.attributes}}, {textNode: this.labelText}];
    return [this.inputLabel];
}

/**
 * Build inline formatted date. Wraps input element in label.
 * NOTE: Posgres format (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd)
 *
 * @public
 */

InputBuilder.prototype.date = function() {
    if (this.value) {
        this.attributes.value = utils.date.formatDate(this.value, "yyyy-mm-dd");
        this.inputLabel.label.textNode = field.label;
        return [this.inputLabel, {input:{attributes: this.attributes}}];
    }
}

/**
 * Build hyperlink as input. Wraps anchor element in label.
 *
 * @public
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

/**
 * Build inline text node.
 *
 * @public
 */

InputBuilder.prototype.textNode = function() {
    const text = {div: {attributes: this.attributes, p: {textNode:this.value }}};
    this.inputLabel.label.textNode = this.labelText;
    return [this.inputLabel, text];
}

/**
 * Build inline formatted timestamp. NOTE Posgres format is :
 * (yyy-mm-ddThh:02:40.677Z) -> JS format (yyyy-mm-dd HH:mm:ss)
 * Wraps input element in label.
 *
 * @public
 */

InputBuilder.prototype.timestamp = function() {
    const timestamp = {time: {attributes: this.attributes}};
    this.inputLabel.label.textNode = this.labelText;
    timestamp.time.textNode = this.value ? utils.date.formatDate(this.value, "yyyy-mm-dd HH:mm:ss") : 'n/a';
    return [this.inputLabel, {div: timestamp}];
}
/**
 * Build password input element. Wraps input element in label.
 *
 * @public
 */

InputBuilder.prototype.password = function() {
    this.attributes.value = this.value;
    this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
    return [this.inputLabel];
}

/**
 * Build repeat password input element. Wraps input element in label.
 *
 * @public
 */

InputBuilder.prototype.repeat_password = function() {
    this.inputLabel.label.childNodes = [
        {textNode: this.labelText},
        {input:{attributes: {type: 'password', id: 'repeat_password', name: 'repeat_password', value: this.value}}}
        ];
    return [this.inputLabel];
}

/**
 * Build button input element.
 *
 * @public
 */

InputBuilder.prototype.button = function() {
    this.attributes.value = this.value;
    return [{input:{attributes: this.attributes}}];
}

/**
 * Build default text input element. Wraps input element in label.
 *
 * @public
 */

InputBuilder.prototype.default = function() {
    this.attributes.value = this.value;
    // wrap input in label element
    this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
    return [this.inputLabel];
}