/*!
 * MLP.Client.Components.Common.Logo
 * File: logo.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import Icon from './icon';
import { ReactComponent as MLPLogo } from '../svg/mlpLogo.svg';
import { ReactComponent as MLPLogoBlk } from '../svg/mlpLogoBlk.svg';

/**
 * Render branding heading (logo + wordmark).
 *
 * @public
 */

const Logo = ({colour=null}) => {

    return (
        <div className={'logo'}>
            <a href={getRoot()}>
                <h1>
                    <div className={'wordmark'}><Icon type={'wordmark'} /></div>
                    <div className={'logo-svg'}>
                        {
                            colour ? <MLPLogoBlk /> : <MLPLogo />
                        }
                    </div>
                </h1>
            </a>
        </div>
    );
};

export default Logo;
