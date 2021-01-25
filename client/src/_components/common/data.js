/*!
 * MLP.Client.Components.Common.Data
 * File: data.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'

/**
 * Data component.
 *
 * @public
 * @param params
 * @return input element
 */

const Data = ({ render='default', value='', href='', label='' }) => {

    /**
     * Data elements.
     */
    // console.log('DATA:', value)

    const _dataElements = {
        link: ({value, href, label}) => {
            return (
                <a href={href} title={label}>
                    <span>{value}</span>
                </a>
            )
        },
        timestamp: ({value})  => {
            return(
                <time>
                    <span>{value}</span>
                </time>
            )
        },
        default: ({value}) => {
            return <div>{value}</div>
        }
    }

    // render data component
    return _dataElements.hasOwnProperty(render)
        ? _dataElements[render]({ value, href, label })
        : _dataElements.default({ value });

}

export default Data;
