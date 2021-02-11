/*!
 * MLP.Client.Components.Common.Download
 * File: download.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI } from '../../_utils/paths.utils.client';
import { useRouter } from '../../_providers/router.provider.client';
import { capitalize } from '../../_utils/data.utils.client';
import Button from './button';

/**
 * Defines image component.
 *
 * @public
 * @return {JSX.Element}
 */

const Download = ({ name='', type='', id='', label='' }) => {

    const router = useRouter();

    // Handler for viewing image on click.
    const onClick = () => {
        console.log(getNodeURI(type, 'download', id))
        //router.update(getNodeURI(type, 'download', id));
    }

    // render download button
    return (
            <Button
                type={type}
                name={label}
                icon={type}
                label={label}
                onClick={onClick}
            />
    )
}

export default Download;
