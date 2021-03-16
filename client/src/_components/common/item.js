/*!
 * MLP.Client.Components.Common.Item
 * File: item.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema } from '../../_services/schema.services.client';
import { sanitize } from '../../_utils/data.utils.client';

/**
 * Render item table component.
 *
 * @public
 * @param {String} model
 * @param {Object} metadata
 * @param {Object} node
 * @param {Object} file
 * @return {JSX.Element}
 */

const Item = ({model, metadata={}, node={}, file={}}) => {

    // generate main schema
    const { fieldsets=[] }  = genSchema('show', model);

    // prepare data for item table: sanitize data by render type
    const filterData = (fieldset) => {
        return Object.keys(fieldset.fields)
            .map(key => {

                // get rendering setting from schema (if exists)
                const { render='' } = fieldset.fields[key] || {};

                // cascade data sources
                const value = metadata.hasOwnProperty(key)
                    ? metadata[key]
                    : file.hasOwnProperty(key)
                        ? file[key]
                        : node.hasOwnProperty(key)
                            ? node[key]
                            : ''
                return {
                    value: sanitize( value, render),
                    label: fieldset.fields[key].label
                }
            });
    };

    return <div>
        {
            fieldsets
                .filter(fieldset => fieldset.hasOwnProperty('legend') && fieldset.legend)
                .map((fieldset, index) => {
                    return <table key={`fsdata_${index}`} className={'item'}>
                        <thead>
                            <tr>
                                <th colSpan={'2'}>{fieldset.legend}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            filterData(fieldset).map((field, index) => {
                                return (
                                    <tr key={`tr_${index}`}>
                                        <th key={`h_${index}`}>
                                            {field.label}
                                        </th>
                                        <td key={`d_${index}`}>
                                            {field.value}
                                        </td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>
                    </table>
                })
        }
    </div>
}

export default Item
