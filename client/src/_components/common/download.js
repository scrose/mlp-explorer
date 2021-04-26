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
import Badge from './badge';

/**
 * Defines download button.
 *
 * @public
 * @return {JSX.Element}
 */

const Download = ({ type='', format='', label='', route=null }) => {

    // download link
    const router = useRouter();

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // create download filename
    const filename = `${type}.${format}`;
    const id = `${type}_${format}`;

    // Handler for file download request.
    const onDownload = async () => {
        // save data stream to file
        try {
            setError(null);
            setLoading(true);
            const res = await router.download(route, format);
            console.log(res)
            if (!res || res.error) {
                setLoading(false);
                return setError(true);
            }
            saveAs(res.data, filename);
            setLoading(false);
        }
        catch (err) {
            console.error(err);
            setLoading(false);
            setError(true)
        }
    }

    // render download button
    return <>
        <Button
            name={id}
            icon={loading ? 'spinner' : 'download'}
            spin={loading}
            label={label}
            title={`Download ${label}`}
            onClick={onDownload}>
        </Button>
        { error && <Badge icon={'error'} label={'Download Error'} className={'error'} /> }
    </>
}

export default Download;
