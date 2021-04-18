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
import { useData } from '../../_providers/data.provider.client';

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
                      batchType = '',
                      opts,
                      route,
                      data,
                      callback
}) => {

    const router = useRouter();
    const api = useData();
    const [progress, setProgress] = React.useState({});
    const [response, setResponse] = React.useState({});
    const [messages, setMessages] = React.useState({});
    const [error, setError] = React.useState(false);

    // check if schema includes file uploads
    const hasUploads = schema.hasOwnProperty('hasFiles') ? schema.hasFiles : false;

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

        // get files set for bulk import
        const fileList = formData.getAll(batchType);

        // import files individually with same metadata
        fileList.map((file, index) => {
            formData.set(batchType, file);
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
        const {data={}} = response || {};
        const { id='' } = api.destructure(data);
        callback(error, model, id);
    }

    // short activity description
    const description = error
        ? 'An error occurred.'
        : response && Object.keys(response).length > 0
            ? 'Finished!'
            : 'In progress ...';

    return (
        <div className={'importer'}>
            <Form
                model={model}
                schema={schema}
                opts={opts}
                init={data}
                route={route}
                callback={ view === 'import' && batchType ? _importBatchData : _importData }
            />
            <Progress
                title={`${ getViewLabel(view) } ${ getModelLabel(model) }`}
                description={description}
                progress={progress}
                messages={messages}
                hasUploads={hasUploads}
                error={error}
                callback={_handleCompletion}
            />
        </div>
    )
}

export default React.memo(Importer);


