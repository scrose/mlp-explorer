/*!
 * MLP.Client.Components.Common.Loading
 * File: loading.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from './icon';

/**
 * Render loading spinner component.
 *
 * @public
 */

const Loading = ({ overlay = false, className='', onStop=()=>{} }) => {
    return <div onDoubleClick={onStop}  className={`spinner ${overlay ? 'overlay' : ''} ${className}`}>
        <div className={`spinner-icon ${overlay ? 'overlay' : ''}`}>
            <Icon type={'spinner'} size={'lg'} spin={true} />
        </div>
    </div>;
};

export default Loading;