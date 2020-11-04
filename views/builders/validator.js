/*!
 * MLP.Core.Views.Builders.Validator
 * File: /views/builders/forms.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict'

/**
 * Module exports.
 * @public
 */

module.exports = ValidatorBuilder;

/**
 * Create form validator schema. Builds handler mapping for
 * validation schema.
 *
 * @public
 */

function ValidatorBuilder() {

}

/**
 * Build form validator DOM from schema.
 *
 * @public
 * @param {Object} params
 */

ValidatorBuilder.prototype.build = function (params) {
    let self = {
        id: params.model.name,
        checklist: {}
    };
    for (const [fieldName, field] of Object.entries(params.model.schema)) {
        // check if field has view render option that includes a validation checklist
        if (!field.hasOwnProperty('render')) continue;
        if (!field.render.hasOwnProperty(params.view)) continue;
        let fieldObj = field.render[params.view];
        if (!fieldObj.hasOwnProperty('validation')) continue;
        self.checklist[fieldName] = {handlers: fieldObj.validation, complete: false};
    }
}
