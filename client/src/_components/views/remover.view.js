/*!
 * MLP.Client.Components.Views.Remover
 * File: remover.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { useRouter } from '../../_providers/router.provider.client';
import { getModelLabel } from '../../_services/schema.services.client';
import Message from '../common/message';
import Button from '../common/button';
import Dialog from '../common/dialog';
import { popSessionMsg } from '../../_services/session.services.client';

/**
 * File/metadata deleter.
 *
 * @param id
 * @param model
 * @param data
 * @param label
 * @param groupType
 * @param onCancel
 * @param callback
 * @public
 */

const Remover = ({
                     id,
                     model,
                     label='',
                     groupType='',
                     onCancel=()=>{},
                     callback=()=>{}
}) => {

    const modelLabel = getModelLabel(model);
    const router = useRouter();
    const [response, setResponse] = React.useState(null);
    const [resMessage, setMessage] = React.useState({});

    console.log(id, model)

    /**
     * Handle delete request.
     *
     * @param {Event} e
     * @private
     */

    const _handleSubmit = (e) => {
        if (!e) return;
        e.preventDefault();
        router.remove(id, model, groupType, _handleCompletion);
    }

    /**
     * Handle completion of deletion.
     *
     * @private
     */

    const _handleCompletion = (res) => {
        const {message={}} = res || {};
        setResponse(res);
        setMessage(message);
    }

    // get progress status message (if available)
    const { msg = '', type = '' } = resMessage || {};

    return (
        <Dialog
            title={`Delete ${getModelLabel(model)} ${label ? ': ' + label : ''}?`}
            setToggle={onCancel}
            callback={_handleSubmit}>
            {
                !response &&
                <div className={'alert-box'}>
                    <p>Please confirm the deletion of this {modelLabel}.</p>
                    {label && <p><b>{label}</b></p>}
                    <p>
                        <em>Note that any dependent metadata attached to this record will also be
                            deleted. For example, the deletion of a surveyor record will delete all
                            associated survey metadata.</em>
                    </p>
                    <div className={'alert-box-buttons'}>
                        <Button icon={'success'} name={'ok'} label={'OK'} onClick={_handleSubmit} />
                        <Button icon={'cancel'} name={'cancel'} label={'Cancel'} onClick={onCancel} />
                    </div>
                </div>
            }
            {
                response &&
                    <div>
                        <div className={'alert-box-buttons'}>
                            <Message closeable={false} message={msg} level={type} />
                            <Button icon={'success'} name={'done'} label={'OK'} onClick={() => {
                                popSessionMsg();
                                callback();
                            }} />
                        </div>
                    </div>
            }
        </Dialog>
    )
}

export default React.memo(Remover);


