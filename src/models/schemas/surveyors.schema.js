/*!
 * MLP.API.Models.Schemas.Surveyors
 * File: surveyors.schema.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Define Surveyor data model schema
 *
 * @private
 */

export default {
    name: 'surveyors',
    label: 'Surveyors',
    fields: {
        id: {
            label: 'ID',
            type: 'string',
            render: {
                delete: {
                    attributes: {
                        type: 'hidden',
                    },
                },
                edit: {
                    attributes: {
                        type: 'hidden',
                    },
                },
            },
        },
        type: {
            label: 'Type',
            type: 'integer',
            render: {
                edit: {},
                delete: {},
            },
        },
        last_name: {
            label: 'Last Name',
            type: 'string',
            render: {
                register: {},
                edit: {},
            },
        },
        given_names: {
            label: 'Given Names',
            type: 'string',
        },
        short_name: {
            label: 'Short Name',
            type: 'string',
            render: {},
        },
        affiliation: {
            label: 'Affiliation',
            type: 'string',
        },
        created_at: {
            label: 'Created at',
            type: 'timestamp',
        },
        updated_at: {
            label: 'Last Modified at',
            type: 'timestamp',
        },
        published: {
            label: 'Published',
            type: 'boolean',
        }
    }
};
