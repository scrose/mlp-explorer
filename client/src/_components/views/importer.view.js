/*!
 * MLP.Client.Components.Views.Importer
 * File: importer.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { useRouter } from '../../_providers/router.provider.client';
import Progress from '../common/progress';
import { getModelLabel, getViewLabel } from '../../_services/schema.services.client';

/**
 * File/metadata importer.
 *
 * @param mode
 * @param model
 * @param schema
 * @param route
 * @param data
 * @param callback
 * @public
 */

const Importer = ({
                      model,
                      view,
                      schema,
                      route,
                      data,
                      callback
}) => {

    const router = useRouter();
    const [progress, setProgress] = React.useState({});
    const [response, setResponse] = React.useState({});
    const [messages, setMessages] = React.useState({});
    const [error, setError] = React.useState(false);

    /**
     * Update progress data. Progress data is updated until
     * uploading has completed.
     *
     * @param index
     * @param name
     * @param e
     * @param msg
     * @param res
     * @private
     */

    const _updateProgress = (index, name, e, msg, res) => {
        // update progress indicator only if event available
        if (e) {

            // get loaded/total bytes data from XHR progress event
            // converted to MB for progress bar
            const { loaded = 0, total = 0 } = e || {};

            // update progress state
            const progressData = {
                name: name,
                loaded: (loaded / 1000000).toFixed(2),
                total: (total / 1000000).toFixed(2),
                percent: ((loaded / (total + 0.0000001)) * 100).toFixed(0),
                done: loaded > 0 && total > 0 && total === loaded
            };
            setProgress(data => ({ ...data, [index]: progressData }));
        }

        // update response data and message state
        setResponse(res);
        const {type=''} = msg || {}
        setMessages(data => ({ ...data, [index]: msg}));
        setError(() => (type === 'error'));
    }

    /**
     * Upload file data. Multiple files uploaded in combined request
     * to API.
     *
     * @private
     * @param uri
     * @param formData
     */

    const _importData = (uri, formData) => {
        return router.upload(
            uri,
            formData,
            _updateProgress.bind(this, 0, null),
        )
            .catch(err => {console.error(err)});
    }

    /**
     * Upload file data. Multiple files uploaded separately
     * to API.
     *
     * @private
     * @param uri
     * @param formData
     */

    const _importBatchData = (uri, formData) => {
        const fileList = formData.getAll('files');
        fileList.map((file, index) => {
            formData.set('files', file);
            return router.upload(
                uri,
                formData,
                _updateProgress.bind(this, index, file.name),
            )
                .catch(err => {console.error(err)});
        });
    }

    /**
     * Handle completion of data import.
     *
     * @private
     */

    const _handleCompletion = () => {
        const {data=''} = response || {};
        const {nodes_id=''} = data || {};
        callback(error, model, nodes_id);
    }

    return (
        <div className={'importer'}>
            {
                view === 'import'
                    ? <p>Use this form to import multiple capture images. Each image
                        will generate a unique historic or modern capture entry.
                        Metadata included below will be applied to all imported captures.</p>
                    : ''
            }
            <Form
                model={model}
                schema={schema}
                init={data}
                route={route}
                callback={ view === 'import' ? _importBatchData : _importData }
            />
            <Progress
                title={`${ getViewLabel(view) } ${ getModelLabel(model) }`}
                description={'in progress ...'}
                progress={progress}
                messages={messages}
                callback={_handleCompletion}
            />
        </div>
    )
}

export default React.memo(Importer);


