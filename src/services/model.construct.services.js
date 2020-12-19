/*!
 * MLP.API.Services.Construct.Model
 * File: model.construct.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { humanize, sanitize, toCamel } from '../lib/data.utils.js';
import * as schemaConstructor from './schema.construct.services.js';

/**
 * Create derived model through composition. The model schema
 * should have the following properties for attributes:

 this.attributes: {
        <field name>: {
            label: '<field label>',
            type: '<datatype>',
            render: {
                <view name>: {
                    attributes: {
                        type: '<input type>',
                        value: <default value>
                    }
                    validation: [<validation checklist>]
                    restrict: [<user role IDs>]
                    options: [<options>]
                },
            }
        }
    }
 }
 *
 * @param {String} modelType
 * @src public
 */

export const create = async (modelType) => {

    // generate schema for model type
    let Schema = await schemaConstructor.create(modelType);
    const schema = new Schema();

    console.log('Schema Node: ', schema.node, 'Schema owner: ', schema.owner,
        'Schema attached: ', schema.attached)

    // initialize model constructor
    let Model = function(attributeValues) {
        this.setData = setData;
        this.setData(attributeValues);
    };

    // define model properties
    Object.defineProperties(Model.prototype, {
        table: {
            value: modelType,
            writable: true
        },
        name: {
            value: toCamel(modelType),
            writable: true
        },
        label: {
            value: humanize(modelType),
            writable: true
        },
        attributes: {
            value: schema.attributes,
            writable: true
        },
        node: {
            value: schema.node,
            writable: true
        },
        attached: {
            value: schema.attached,
            writable: true
        },
        hasNode: {
            value: !!schema.node,
            writable: false
        },
        getId: {
            value: getId,
            writable: false
        },
        setId: {
            value: setId,
            writable: false
        },
        getIdKey: {
            value: getIdKey,
            writable: false
        },
        getValue: {
            value: getValue,
            writable: false
        },
        setValue: {
            value: setValue,
            writable: false
        },
        getData: {
            value: getData,
            writable: false
        },
        setDataOptions: {
            value: setDataOptions,
            writable: false
        },
        clear: {
            value: clear,
            writable: false
        },
        hasOwners: {
            value: function() {
                return !!schema.owners.length
            },
            writable: false
        },
        hasOwnerReference: {
            value: function() {
                return schema.attributes.hasOwnProperty('owner_id');
            },
            writable: false
        },
    });
    return Model;
};


/**
 * Set values of model schema attributes.
 *
 * @param {Object} data
 * @src public
 */

function setData(data=null) {

    // create context reference
    const self = this;

    // select object-defined data
    if (typeof data === 'object' && data !== null) {

        // select either first row of data array or single data object
        // NOTE: model can only hold data for single record
        const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;

        // filter input data attributes by model schema attributes
        Object.entries(inputData).forEach(([key, value]) => {
            console.log(self.label, ' field:', key, ', value:', value)

            // assert input attribute exists in model
            if (!self.attributes.hasOwnProperty(key)) throw Error('violatesSchema');
            // TODO: should also check that input data has correct type
            self.attributes[key].value = sanitize(value, self.attributes[key].type);
        });

        // set node data (if provided)
        if (this.hasNode) {
            this.node.attributes.id.value = this.attributes.nodes_id.value;
            this.node.attributes.type.value = this.table;
            this.node.attributes.owner_id.value = this.attributes.hasOwnProperty('owner_id')
                ? this.attributes.owner_id.value
                : null;
        }

    } else {
        // default constructor
        Object.entries(self.attributes).forEach(([key, field]) => {
            field.value = sanitize(null, self.attributes[key].type);
        });
    }
}

/**
 * Set field value in model schema.
 *
 * @param {String} key
 * @param {Object} value
 * @src public
 */

function setValue(key, value) {
    if (typeof key === 'string' && this.attributes.hasOwnProperty(key)) {
        this.attributes[key].value = sanitize(value, this.attributes[key].type);
    }
}

/**
 * Get ID value in model schema.
 *
 * @src public
 */

function getId() {
    return this.hasNode
        ? this.attributes.nodes_id
        : this.attributes.id;
}

/**
 * Set ID value in model schema.
 *
 * @param {integer} id
 * @src public
 */

function setId(id) {
    if (this.hasNode) {
        this.attributes.nodes_id = id;
        this.node.attributes.id = id;
    }
    else {
        this.attributes.id = id;
    }
}

/**
 * Get ID key column in model schema.
 *
 * @src public
 */

function getIdKey() {
    return this.hasNode ? 'nodes_id' : 'id';
}

/**
 * Get field value from model schema.
 *
 * @param {String} field
 * @return {Object} field data
 * @src public
 */

function getValue(field=null) {
    return (field)
        ? this.attributes[field].value
        : null;
}

/**
 * Get field values from model.
 *
 * @return {Object} filtered data
 * @src public
 */

function getData() {
    let filteredData = {};
    Object.entries(this.attributes).forEach(([key, field]) => {
        filteredData[key] = field.value;
    });
    return filteredData;
}

/**
 * Clear field values from model attributes.
 *
 * @return {object} for chaining
 * @src public
 */

function clear() {
    Object.entries(this.attributes).map(attr => {
        attr.value = null;
        });
    if (this.hasNode)
        Object.entries(this.node.attributes).map(attr => {
            attr.value = null;
        });
}

/**
 * Set options of provided schema field.
 *
 * @param {String} field
 * @param {Array} options
 * @src public
 */

function setDataOptions(field, options) {
    if (field
        && this.attributes.hasOwnProperty(field)
        && typeof options === 'object')
        this.attributes[field].options = options ? options : null;
}

