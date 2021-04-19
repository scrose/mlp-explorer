/*!
 * MLP.Client.Components.Common.Logo
 * File: logo.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import { getAppTitle } from '../../_services/schema.services.client';
import {ReactComponent as MLPLogo} from '../svg/logo.svg';

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
                    <div className={'logo-svg'}><MLPLogo /></div>
                    <div className={'wordmark'}>{ getAppTitle() }</div>
                </h1>
            </a>
        </div>
    );
}

export default Logo;
