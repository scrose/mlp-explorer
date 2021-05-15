/*!
 * MLP.Client.Components.Tools.Exporter
 * File: exporter.tools.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Download from '../common/download';
import Message, { UserMessage } from '../common/message';
import Input from '../common/input';
import Button from '../common/button';

/**
 * File/metadata importer.
 *
 * @public
 */

const Exporter = ({setToggle}) => {

    const options = [
        { label: 'CSV (GIS)', value: 'csv', endpoint: 'gis/csv' },
        { label: 'JSON (GIS)', value: 'json', endpoint: 'gis/json' }
    ];

    const [format, setFormat] = React.useState(null);
    const [message, setMessage] = React.useState(null);

    const _handleError = (err) => {
        setMessage(err);
    }

    // Handler for file format selection.
    const _handleSelect = (e) => {
        const { target = {} } = e || {};
        const { value = '' } = target;
        const opt = options.find(opt => value === opt.value);
        setFormat(opt);
        setMessage({ msg: `Export format ${opt.label} selected.`, type: 'info' });
    };

    // render download-as button
    return <fieldset className={'submit'}>
        <UserMessage message={message} closeable={false} />
        <Input
            label={'Export as'}
            type={'select'}
            options={options}
            value={format ? format.value : ''}
            onChange={_handleSelect}
        />
        {
            format &&
            <div className={'h-menu'}>
                <ul>
                    <li>
                        <Download
                            type={'mlp_export'}
                            format={format.value}
                            label={`Export as ${ format.label }`}
                            route={`/nodes/export/${format.endpoint}`}
                            callback={_handleError}
                        />
                    </li>
                    <li>
                        <Button icon={'cancel'} label={'Cancel'} onClick={()=>{setToggle(false)}} />
                    </li>
                </ul>
            </div>
        }
    </fieldset>;
}

export default Exporter;


