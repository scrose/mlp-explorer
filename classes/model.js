/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Classes.Model
  File:         /classes/model.js
  ------------------------------------------------------
  Superclass for the data model. The model schema has the
  following object properties:

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
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 31, 2020
  ======================================================
*/

'use strict';

class Model {

    constructor(data = null) {
        this.inputData = data;
    }

    // set values to schema fields
    setData (data) {
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
    };

    // set single value from model
    setValue(field, value) {
        if (field && this.schema.hasOwnProperty(field)) {
            this.schema[field].value = (value) ? value : null;
        }
    };

    // get single value from model
    getValue(field) {
        if (field) return (this.schema.hasOwnProperty(field)) ? this.schema[field].value : null;
    };

    // get data values set in model
    getData() {
        let filteredData = {}
        Object.entries(this.schema).forEach(([key, field]) => {
            filteredData[key] = field.value;
        });
        return filteredData;
    };

    // clear data values set in model
    clear() {
        if (this.hasOwnProperty('schema')) {
            Object.entries(this.schema).forEach(([key, field]) => {
                field.value = '';
            });
        }
        return this;
    };


}

module.exports = Model