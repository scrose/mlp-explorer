/*!
 * MLP.Client.Components.Views.Remover
 * File: remover.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { useRouter } from '../../_providers/router.provider.client';
import { getModelLabel } from '../../_services/schema.services.client';
import { UserMessage } from '../common/message';
import Button from '../common/button';
import Dialog from '../common/dialog';

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
        const {response = {}} = res || {};
        const {message={}} = response || {};
        setResponse(response);
        setMessage(message);
    }

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
                        <Button icon={'success'} name={'ok'} label={'Delete'} onClick={_handleSubmit} />
                        <Button icon={'cancel'} name={'cancel'} label={'Cancel'} onClick={onCancel} />
                    </div>
                </div>
            }
            {
                response &&
                    <div>
                        <div className={'alert-box-buttons'}>
                            <UserMessage closeable={false} message={resMessage} />
                            <Button
                                icon={'success'}
                                name={'done'}
                                label={'Close'}
                                onClick={()=>{
                                    const {type=''} = resMessage || {};
                                    callback(type==='error' ? true : null, response);
                                }} />
                        </div>
                    </div>
            }
        </Dialog>
    )
}

export default React.memo(Remover);


