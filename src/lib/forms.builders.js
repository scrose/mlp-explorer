/*!
 * MLP.Core.Views.Builders.Forms
 * File: /views/builders/forms.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import InputBuilder from './input.builders.js';

/**
 * Create Form Builder.
 *
 * @public
 */

function FormBuilder() {
  this.inputBuilder = new InputBuilder();
}

/**
 * Build HTML form DOM from schema.
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
        name: params.model.name,
      },
      fieldset: { legend: { textNode: params.legend || params.model.label } },
    },
  };
  let inputs = [];
  let validator = { id: params.model.name, checklist: {} };
  // get user role ID to restrict access to the field
  let role = params.restrict ? (params.user ? params.user.role_id : 1) : 1;
  // create input builder
  let inputBuilder = this.inputBuilder;

  // filter non-restricted fields in schema
  Object.keys(params.model.attributes)
    .filter(key => params.model.attributes[key].restrict.includes(role))
    .map(key => {
      // select rendering view
      let renderObj = obj.render[params.view];
      // initialize field (<input>) attributes
      renderObj.attributes = renderObj.hasOwnProperty('attributes') ? renderObj.attributes : {};
      // option to use default or custom input type set in schema
      renderObj.attributes.type = renderObj.attributes.hasOwnProperty('type') ? renderObj.attributes.type : obj.type;

      // build input built from schema parameters
      inputs.push(
        inputBuilder.build({
          name: key,
          attributes: renderObj.attributes,
          value: obj.hasOwnProperty('value') ? obj.value : '',
          label: obj.label,
        })
      );

      // add validation checklist (if exists) to validator
      if (renderObj.hasOwnProperty('validation'))
        validator.checklist[key] = { handlers: renderObj.validation, complete: false };
    });

  // initialize buttons wrapped in <div> element
  let buttons = { div: { attributes: { class: 'buttons' }, childNodes: [] } };

  // add submit button
  if (params.actions.hasOwnProperty('submit'))
    buttons.div.childNodes.push(
      inputBuilder.build({
        name: 'submit_' + params.model.name,
        attributes: { type: 'submit' },
        value: params.actions.submit.hasOwnProperty('value') ? params.actions.submit.value : 'Submit',
        label: '',
      })
    );

  // add cancel button <link>
  if (params.actions.hasOwnProperty('cancel'))
    buttons.div.childNodes.push(
      inputBuilder.build({
        name: 'submit',
        attributes: {
          type: 'link',
          url: params.actions.cancel.url,
          linkText: params.actions.cancel.hasOwnProperty('value') ? params.actions.cancel.value : 'Cancel',
        },
        value: '',
        label: '',
      })
    );

  // return form and validator schemas
  inputs.push(buttons);
  this.schema.form.fieldset.childNodes = inputs;
  return { form: this.schema, validator: validator };
};


/**
 * Build form DOM and export as JSON schema
 *
 * @public
 * @param {Object} params
 * @return {Object} DOM schema
 */

function builder(params) {
    let formBuilder = new FormBuilder();
    let {form, validator} = formBuilder.build(params)
    return {
        form: JSON.stringify(form),
        validator: JSON.stringify(validator)
    };
}

export default builder;