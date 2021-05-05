/*!
 * MLP.Client.Tools.IAT.Download
 * File: iat.download.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../../common/button';
import Message from '../../common/message';
import Input from '../../common/input';

/**
 * Defines download local file button. Expects callback to retrieve data
 * as Blob for the selected file format.
 *
 * @public
 * @return {JSX.Element}
 */

export const SaveAs = ({ options = [], setSelected=()=>{}, setToggle=()=>{} }) => {

    const [format, setFormat] = React.useState(null);

    // Handler for file format selection.
    const _handleSelect = (e) => {
        const { target = {} } = e || {};
        const { value = '' } = target;
        const opt = options.find(opt => value === opt.value);
        setFormat({
            type: value,
            ext: opt ? opt.label : null
        });
    };

    // Handler for file save as request.
    // - set canvas properties for file save
    const _handleDownload = () => {
        setSelected(data => ({
            ...data,
            save: true,
            blobType: format
        }));
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