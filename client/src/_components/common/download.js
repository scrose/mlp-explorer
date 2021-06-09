/*!
 * MLP.Client.Components.Common.Download
 * File: download.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { saveAs } from 'file-saver';
import { useRouter } from '../../_providers/router.provider.client';
import { download } from '../../_services/api.services.client'
import Button from './button';

/**
 * Defines download button.
 *
 * @public
 * @return {JSX.Element}
 */

const Download = ({ filename='download', type='', format='', label='', route=null, callback=()=>{} }) => {

    // download link
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);

    // create download ID
    const id = `${type}_${format}`;

    const _handleError = (err) => {
        setMessage(err);
        callback({msg: 'Download error', type:'error'});
    }

    // Handler for file download request.
    const _handleDownload = async () => {
        // save data stream to file
        try {
            setLoading(true);
            const res = await download(route, format, router.online);
            if (!res || res.error) {
                setLoading(false);
                return _handleError({msg: 'File download failed.', type:'error'});
            }
            saveAs(res.data, filename);
            setLoading(false);
        }
        catch (err) {
            setLoading(false);
            _handleError({msg: 'File download failed.', type:'error'})
        }
    }

    // render download button
    return <Button
                name={id}
                icon={
                    loading
                        ? 'spinner'
                        : message && message.hasOwnProperty('msg')
                            ? 'error'
                            : 'download'
                }
                spin={loading}
                label={label}
                title={
                    message && message.hasOwnProperty('msg')
                        ? message.msg
                        : `Download ${filename}.`
                }
                onClick={_handleDownload}>
            </Button>
}

export default Download;

