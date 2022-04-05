/*!
 * MLP.Client.Tools.IAT.Download
 * File: downloader.iat.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Message from '../common/message';
import Input from '../common/input';
import { saveAs } from 'file-saver';

/**
 * Creates a Blob object representing the image contained in
 * the canvas; this file may be cached on the disk or stored
 * in memory at the discretion of the user agent. If type
 * is not specified, the image type is image/png. The created
 * image is in a resolution of 96dpi.
 *
 * @private
 */

export const downloader = async (id, canvas, format) => {
    const filename = `${id}.${format.ext}`;
    console.log('Saving to file ...', filename);

    // save canvas blob as file to local disk (file-saver)
    canvas.toBlob((blob) => {
        saveAs(blob, filename);
    }, format.type, format.quality);
}

/**
 * Defines download local file button. Expects callback to retrieve data
 * as Blob for the selected file format.
 *
 * @public
 * @return {JSX.Element}
 */

export const SaveAs = ({ options = [], setToggle=()=>{}, callback=()=>{} }) => {

    const [format, setFormat] = React.useState(null);

    // Handler for file format selection.
    const _handleSelect = (e) => {
        const { target = {} } = e || {};
        const { value = '' } = target;
        const opt = options.find(opt => value === opt.value);
        setFormat({
            type: value,
            ext: opt ? opt.label : null,
            quality: 0.95
        });
    };

    // Handler for file save as request.
    // - set canvas properties for file save
    const _handleDownload = () => {
        callback({
            status: 'save',
            props: format
        });
        setToggle(false);
    };

    // render download-as button
    return <fieldset className={'submit'}>
        <Message
            closeable={false}
            message={{ msg: `File format ${format} selected.`, type: 'info' }}
        />
        <Input
            label={'Save the file as'}
            type={'select'}
            options={options}
            value={format}
            onChange={_handleSelect}
        />
        {
            format &&
                <>
                    <Button
                        name={'save'}
                        icon={'download'}
                        label={`Save As ${String(format.ext).toUpperCase()}`}
                        title={`Save As ${String(format.ext).toUpperCase()}`}
                        onClick={_handleDownload}>
                    </Button>&#160;
                    <Button icon={'cancel'} label={'Cancel'} onClick={()=>{setToggle(false)}} />
            </>
        }
    </fieldset>;
};

export default SaveAs;