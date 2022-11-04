/*!
 * MLP.Client.Components.Common.Download
 * File: download.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { saveAs } from 'file-saver';
import { useRouter } from '../../_providers/router.provider.client';
import { download } from '../../_services/api.services.client'
import Button from './button';
import {genID} from "../../_utils/data.utils.client";

/**
 * Defines download button.
 *
 * @public
 * @param filename
 * @param format
 * @param label
 * @param route
 * @param className
 * @param size
 * @param callback
 * @return {JSX.Element}
 */

const Download = ({
                      filename='',
                      format='',
                      label='',
                      route=null,
                      className='',
                      size='lg',
                      callback=()=>{}
                  }) => {

    // download link
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);

    // create download ID
    const id = genID();

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
                return _handleError({msg: label ? 'File download failed.' : '', type:'error'});
            }
            saveAs(res.data, filename || `file_${id}.${format}`);
            setLoading(false);
            setMessage({msg: label ? 'File downloaded.' : '', type: 'success'});
            callback()
        }
        catch (err) {
            setLoading(false);
            _handleError({msg: label ? 'File download failed.' : '', type: 'error'})
        }
    }

    // render download button
    return <Button
            disabled={loading}
            size={size}
            icon={
                loading
                    ? 'spinner'
                    : message && message.type === 'error'
                        ? 'error'
                        : format === 'zip' ? 'bulk_download' : 'download'
            }
            spin={loading}
            label={message ? message.msg : loading && label ? 'Downloading...' : label}
            className={`${className} ${message ? message.type : ''}`}
            title={
                message && message.hasOwnProperty('msg')
                    ? message.msg
                    : `Download ${route.indexOf('raw') > 0 ? 'Original (Raw) Version:' : 'Scaled Version:'} ${filename || `file_${id}.${format}`}.`
            }
            onClick={_handleDownload}>
        </Button>
}

export default Download;

