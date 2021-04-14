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
import { useData } from '../../_providers/data.provider.client';

/**
 * Defines download button.
 *
 * @public
 * @return {JSX.Element}
 */

const Download = ({ type='', format='', label='', uri='' }) => {

    // download link
    const router = useRouter();
    const api = useData();

    // create download filename
    const filename = `${type}.${format}`;
    const id = `${type}_${format}`;

    // Handler for viewing image on click.
    const clickHandler = async () => {
        const blob = await router.download(uri, format);
        // save data stream to file
        try {
            saveAs(blob, filename);
        }
        catch (err) {
            console.error(err)
            api.setMessage({msg: 'A download error occurred. Please contact the site administrator.', type: 'error'})
        }
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
