/*!
 * MLP.API.Models.Schemas.Surveys
 * File: surveys.schema.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Define Survey data model schema
 *
 * @private
 */

export default {
    name: 'surveys',
    label: 'Surveys',
    attributes: {
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
                }
            }
        },
        type: {
            label: 'Type',
            type: 'integer',
            render: {
                edit: {},
                delete: {},
            }
        },
        surveyor_id: {
            label: 'Surveyor',
            type: 'string',
            render: {
                register: {},
                edit: {},
            }
        },
        name: {
            label: 'Given Names',
            type: 'string',
        },
        historical_map_sheet: {
            label: 'Short Name',
            type: 'string',
            render: {},
        },
        created_at: {
            label: 'Created at',
            type: 'timestamp',
        },
        updated_at: {
            label: 'Last Modified at',
            type: 'timestamp',
        }
    }
};
