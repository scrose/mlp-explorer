/*!
 * MLP.Client.Components.Users.Importer
 * File: importer.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Batch importer view.
 *
 * @public
 */

const Importer = ({model, schema, data}) => {

    const api = useRouter();
    const [progress, setProgress] = React.useState({});
    const [messages, setMessages] = React.useState({});

    /**
     * Update progress data. Progress data is updated until
     * uploading has completed.
     *
     * @param index
     * @param name
     * @param e
     * @param msg
     * @public
     */

    const updateProgress = (index, name, e, msg) => {
        // update progress indicator only if event available
        if (e) {
            // get upload data from callback event
            const { loaded = 0, total = 0 } = e || {};

            // update progress state
            const progressData = {
                name: name,
                loaded: (loaded / 1000000).toFixed(2),
                total: (total / 1000000).toFixed(2),
                percent: ((loaded / (total + 0.0000001)) * 100).toFixed(0)
            };
            setProgress(data => ({ ...data, [index]: progressData }));
        }
        // update message state
        setMessages(data => ({ ...data, [index]: msg}));
    }

    /**
     * Upload file data. Multiple files uploaded separately
     * to API.
     *
     * @public
     * @param uri
     * @param formData
     */

    const importData = (uri, formData) => {
        const fileList = formData.getAll('files');
        fileList.map((file, index) => {
            formData.set('files', file);
            return api.upload(uri, formData, updateProgress.bind(this, index, file.name))
                .catch(err => {console.error(err)});
        });
    }

    return (
        <div className={'importer'}>
            <Form
                model={model}
                schema={schema}
                init={data}
                callback={importData}
            />
            {
                Object.keys(progress).map(key => {

                    // get progress indicator data
                    const data = progress[key];

                    // get progress status message (if available)
                    const {msg='', type=''} = messages[key] || {};

                    const progressBar = {
                        width: `${data.percent}%`
                    };

                    // render progress indicator
                    return (
                        <div className={`msg ${type}`} key={key}>
                            <div>{msg}</div>
                            <div className={'progress-bar'} style={progressBar}>{`${data.percent}%`}</div>
                            <div>{`${(data.loaded)}MB of ${(data.total)}MB (Image: ${data.name})`}</div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default React.memo(Importer);
