/*!
 * MLP.Core.Views.Builders.Input
 * File: /views/builders/input.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

let utils = require('../../src/lib');

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
    // select builder function by input type
    return typeof this[params.attributes.type] === "function" ? this[params.attributes.type]() : this.default();
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
    return {input:{attributes: this.attributes}};
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
    this.inputLabel.label.textNode = this.labelText;
    this.inputLabel.input = {attributes: this.attributes};
    return this.inputLabel;
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
        this.inputLabel.label.textNode = this.label;
        this.inputLabel.input = {attributes: this.attributes}
        return this.inputLabel;
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
    // add label (if provided)
    if (this.labelText)
        this.inputLabel.label.childNodes = [{textNode: this.labelText}, {div: hyperlink}];
    return this.labelText ? this.inputLabel : hyperlink;
}

/**
 * Build inline text node.
 *
 * @public
 */

InputBuilder.prototype.textNode = function() {
    const text = {div: {attributes: this.attributes, p: {textNode:this.value }}};
    this.inputLabel.label.textNode = this.labelText;
    this.inputLabel.childNodes = [{input:{attributes: this.attributes}}, text]
    return this.inputLabel;
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
    timestamp.time.textNode = this.value
        ? utils.date.formatDate(this.value, "yyyy-mm-dd HH:mm:ss")
        : 'n/a';
    this.inputLabel.div = timestamp
    return this.inputLabel;
}
/**
 * Build password input element. Wraps input element in label.
 *
 * @public
 */

InputBuilder.prototype.password = function() {
    if (this.value) this.attributes.value = this.value;
    if (this.attributes.hasOwnProperty('repeat')) delete this.attributes.repeat;
    this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
    return this.inputLabel;
}

/**
 * Build button input element.
 *
 * @public
 */

InputBuilder.prototype.submit = function() {
    if (this.value) this.attributes.value = this.value;
    return {input:{attributes: this.attributes}};
}

/**
 * Build default text input element. Wraps input element in label.
 *
 * @public
 */

InputBuilder.prototype.default = function() {
    if (this.value) this.attributes.value = this.value;
    this.inputLabel.label.childNodes = [{textNode: this.labelText}, {input:{attributes: this.attributes}}];
    return this.inputLabel;
}