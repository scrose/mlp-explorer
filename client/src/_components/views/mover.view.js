/*!
 * MLP.Client.Components.Views.Mover
 * File: mover.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { useRouter } from '../../_providers/router.provider.client';
import { UserMessage } from '../common/message';
import Button from '../common/button';
import Dialog from '../common/dialog';
import { createNodeRoute } from '../../_utils/paths.utils.client';

/**
 * File/metadata deleter.
 *
 * @param id
 * @param model
 * @param ownerID
 * @param label
 * @param ownerLabel
 * @param onCancel
 * @param callback
 * @public
 */

const Mover = ({
                     id,
                     model,
                     ownerID='',
                     label='',
                     ownerLabel='',
                     onCancel=()=>{},
                     callback=()=>{}
}) => {

    const router = useRouter();
    const [response, setResponse] = React.useState(null);
    const [resMessage, setMessage] = React.useState({});

    /**
     * Handle move request.
     *
     * @private
     */

    const _handleSubmit = () => {
        const formData = new FormData();
        formData.append('owner_id', ownerID);
        router.post(createNodeRoute(model, 'move', id), formData)
            .then(res => {
                if (res.error) return setMessage(res.error);
                _handleCompletion(res);
            }).catch(err => {
            setMessage(err);
            console.warn('here!', err)
        });
    }

    /**
     * Handle completion of move.
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
            title={`Move${label ? ': ' + label : ''}?`}
            setToggle={onCancel}
            callback={_handleSubmit}>
            {
                !response &&
                <div className={'alert-box'}>
                    <p>Please confirm the move of {label} to {ownerLabel}.</p>
                    {label && <p><b>{label}</b></p>}

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
                            <UserMessage closeable={false} message={resMessage} />
                            <Button icon={'success'} name={'done'} label={'OK'} onClick={callback} />
                        </div>
                    </div>
            }
        </Dialog>
    )
}

export default React.memo(Mover);


