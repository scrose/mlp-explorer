/*!
 * MLP.Client.Components.Common.Item
 * File: editor.js
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
 * @param {Array} data
 * @param {String} view
 * @param {String} model
 * @return {JSX.Element}
 */

const Item = ({data, view, model}) => {

    // generate main schema
    const { fieldsets=[] }  = genSchema(view, model);

    // prepare data for item table
    // - sanitize data by render type
    const filterData = (fieldset) => {
        return Object.keys(fieldset.fields)
            .map(key => {
                const { render = '' } = fieldset.fields[key] || {};
                const field = {};
                field.value = sanitize(data[key], render);
                field.label = fieldset.fields[key].label;
                return field;
            });
    };

    return <div>
        {
            fieldsets
                .filter(fieldset => fieldset.hasOwnProperty('legend') && fieldset.legend)
                .map((fieldset, index) => {
                    console.log(fieldset)
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
