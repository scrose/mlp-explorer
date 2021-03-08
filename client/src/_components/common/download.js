/*!
 * MLP.Client.Components.Common.Download
 * File: download.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { saveAs } from 'file-saver';
import { useRouter } from '../../_providers/router.provider.client';
import Button from './button';

/**
 * Defines download button.
 *
 * @public
 * @return {JSX.Element}
 */

const Download = ({ type='', format='', label='', uri='' }) => {

    // download link
    const router = useRouter();

    // create download filename
    const filename = `${type}.${format}`;
    const id = `${type}_${format}`;

    // Handler for viewing image on click.
    const clickHandler = async () => {
        const blob = await router.download(uri, format);
        // save data stream to file
        saveAs(blob, filename);
    }

    // render download button
    return (
        <Button
            name={id}
            icon={type}
            label={label}
            onClick={clickHandler}
        />
    )
}

export default Download;
