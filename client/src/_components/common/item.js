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
 * @return {JSX.Element}
 */

const Item = ({data: apiData, view, model}) => {

    // prepare data for item table
    // - sanitize data by render type
    const filterData = () => {

        // extract schema settings from data
        const { data=[] } = apiData || {};

        // generate main schema
        const { fields={} } = genSchema(view, model)

        // sanitize top-level data
        return Object.keys(fields)
            .filter(key => fields[key].render !== 'hidden')
            .map(key => {
                const { render='' } = fields[key] || {};
                const field = {};
                field.value = sanitize(data[key], render);
                field.label = fields[key].label;
                return field;
            });
    };

    return <div>
        <table className={'item'}>
            <tbody>
            {
                filterData().map((field, index) => {
                    return (
                        <tr key={`tr_${ index }`}>
                            <th key={`h_${ index }`}>
                                {field.label}
                            </th>
                            <td key={`d_${ index }`}>
                                {field.value}
                            </td>
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
    </div>
}

export default Item
