/*!
 * MLP.Core.Models.Base
 * File: /models/base.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module exports.
 * @public
 */

module.exports = Model

/**
 * Abstract base prototype for data models. The model schema
 * should have the following properties for fields:

 this.schema = {
        <field name>: {
            label: '<field label>',
            type: '<datatype>',
            restrict: [<user role IDs>],
            render: {
                <view name>: {
                    attributes: {
                        type: '<input type>',
                        value: <default value>
                    }
                },
                select: {
                    option: '<option name>',
                    value: '<option value>'
                },
                validation: [<validation checklist>]
            }
        }
  }
 *
 * @api private
 * @param {String} name
 * @param {String} label
 * @param {Object} data
 * @param {Object} schema
 */

function Model(name, label, data=null, schema=null) {
    Object.defineProperty(this, 'name', {
        value: name,
        writable: false
    });
    Object.defineProperty(this, 'label', {
        value: label,
        writable: false
    });
    Object.defineProperty(this, 'data', {
        value: data,
        writable: true
    });
    Object.defineProperty(this, 'schema', {
        value: schema,
        writable: true
    });

    // if (typeof data === 'object' && data !== null) {
    //     // merge data into this, ignoring prototype properties
    //     for (var prop in data) {
    //         if (!(prop in this)) {
    //             this[prop] = data[prop]
    //         }
    //     }
    // }
}


/**
 * Set values of model schema fields.
 *
 * @param {Object} data
 * @api public
 */

defineMethod(Model.prototype, 'setData', function (data) {
    // set data values in schema
    if (data !== null && this.hasOwnProperty('schema')) {
        const inputData = (data.hasOwnProperty('rows')) ? data.rows[0] : data;
        let model = this;
        Object.entries(this.schema).forEach(([key, field]) => {
            field.value = inputData.hasOwnProperty(key) ? inputData[key] : null;
            // add convenient field reference
            model[key] = model.hasOwnProperty(key) ? model[key] : field.value;
        });
        return;
    }
    // otherwise, empty schema of values
    this.clear();
});


/**
 * Set field value in model schema.
 *
 * @param {String} field
 * @param {Object} data
 * @api public
 */

defineMethod(Model.prototype, 'setValue', function(field, value) {
    if (field && this.schema.hasOwnProperty(field)) {
        this.schema[field].value = (value) ? value : null;
    }
});


/**
 * Get field value from model schema.
 *
 * @param {String} field
 * @api public
 */

defineMethod(Model.prototype, 'getValue', function(field) {
    if (field) return (this.schema.hasOwnProperty(field)) ? this.schema[field].value : null;
});

/**
 * Get field value from model schema.
 *
 * @return {Object} filtered data
 * @api public
 */

defineMethod(Model.prototype, 'setValue', function () {
    let filteredData = {}
    Object.entries(this.schema).forEach(([key, field]) => {
        filteredData[key] = field.value;
    });
    return filteredData;
});


/**
 * Clear field values from model schema.
 *
 * @return {Model} for chaining
 * @api public
 */

defineMethod(Model.prototype, 'clear', function () {
    if (this.hasOwnProperty('schema')) {
        Object.entries(this.schema).forEach(([key, field]) => {
            field.value = '';
        });
    }
    return this;
});



/**
 * Helper function for creating a method on a prototype.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} fn
 * @private
 */
function defineMethod(obj, name, fn) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: false,
        value: fn,
        writable: true
    });
}

