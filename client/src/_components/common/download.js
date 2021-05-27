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
import { UserMessage } from './message';

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
    }

    // Handler for file download request.
    const _handleDownload = async () => {
        // save data stream to file
        try {
            setLoading(true);
            const res = await download(route, format, router.online);
            console.log('RESPONSE', res)
            if (!res || res.error) {
                setLoading(false);
                return _handleError({msg: 'Download Error', type:'error'});
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
    return <div className={'h-menu'}>
        <ul>
            <li>
                <Button
                    name={id}
                    icon={loading ? 'spinner' : 'download'}
                    spin={loading}
                    label={label}
                    title={`Download ${label}`}
                    onClick={_handleDownload}>
                </Button>
            </li>
            <li>
                <UserMessage className={'inline'} message={message} closeable={true} />
            </li>
        </ul>
    </div>
}

export default Download;

