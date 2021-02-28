/*!
 * MLP.Client.Components.Common.Loading
 * File: loading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'

const Loading = () => {
    const spinner = '/assets/img/load_spinner.gif';
    return (
        <div>
            <img src={spinner} alt={'Loading...'}/>
        </div>
    )
}

export default Loading;
