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

const Download = ({ type='', format='', label='', route=null, callback=()=>{} }) => {

    // download link
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    // create download filename
    const filename = `${type}.${format}`;
    const id = `${type}_${format}`;

    // Handler for file download request.
    const _handleDownload = async () => {
        // save data stream to file
        try {
            setLoading(true);
            const res = await download(route, format, router.online);
            console.log(res)
            if (!res || res.error) {
                setLoading(false);
                callback({msg: 'Download error', type:'error'});
            }
            saveAs(res.data, filename);
            setLoading(false);
        }
        catch (err) {
            console.error(err);
            setLoading(false);
            callback({msg: 'Download error', type:'error'});
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
            onClick={_handleDownload}>
        </Button>
    </>
}

export default Download;

