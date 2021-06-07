/*!
 * MLP.Client.Components.Common.Logo
 * File: logo.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import Icon from './icon';

/**
 * Render branding heading (logo + wordmark).
 *
 * @public
 */

const Logo = () => {

    return (
        <div className={'logo'}>
            <a href={ getRoot() }>
                <h1>
                    <div className={'logo-svg'}><Icon type={'mlp'} /></div>
                    <div className={'wordmark'}><Icon type={'wordmark'} /></div>
                </h1>
            </a>
        </div>
    );
}

export default Logo;
