/*!
 * MLP.Client.Components.Views.Mover
 * File: mover.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { useRouter } from '../../_providers/router.provider.client';
import { UserMessage } from '../common/message';
import Button from '../common/button';
import Dialog from '../common/dialog';
import {getModelLabel} from '../../_services/schema.services.client';
import {useNav} from "../../_providers/nav.provider.client";


/**
 * File/metadata deleter.
 *
 * @param id
 * @param onCancel
 * @param callback
 * @public
 */

const Mover = ({
                   onCancel=()=>{},
                   callback=()=>{}
               }) => {

    const router = useRouter();
    const nav = useNav();
    const [response, setResponse] = React.useState(null);
    const [resMessage, setMessage] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [source, setSource] = React.useState({});
    const [destination, setDestination] = React.useState({});
    const _isMounted = React.useRef(true);

    // get source/destination for node moves
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && nav.selected) {
            const {source = null, destination = null} = nav.selected || {};
            setSource(source);
            setDestination(destination);
        }
        return () => {
            _isMounted.current = false;
        };
    }, [nav.selected, setSource, setDestination]);

    /**
     * Handle move request.
     *
     * @private
     */

    const _handleSubmit = () => {
        router.get(`/${source.model}/move/${source.id}/${destination.id}`)
            .then(res => {
                if (res.error) setMessage(res.error);
                else _handleCompletion(res);
            }).catch(err => {
            setMessage(err);
        });
    }

    /**
     * Handle completion of move.
     *
     * @private
     */

    const _handleCompletion = (res) => {
        const {error=null, response = {}} = res || {};
        const {message={}, data={}} = response || {};
        const {node={}} = data || {};
        setError(error);
        setResponse(node);
        setMessage(message);
    }

    return (
        <Dialog
            title={`Move Item to New Container (Owner)`}
            setToggle={onCancel}
            callback={_handleSubmit}>
            {
                !response && !resMessage &&
                <div className={'alert-box'}>
                    <p>Please confirm the move of:</p>
                    <p>
                        <b>{source.label} ({getModelLabel(source.model)})</b>
                    </p>
                    <p>To new container (owner):</p>
                    <p>
                        <b>{destination.label} ({getModelLabel(destination.model)})</b>
                    </p>
                    <div className={'alert-box-buttons'}>
                        <Button icon={'success'} name={'ok'} label={'Move Item'} onClick={_handleSubmit} />
                        <Button icon={'cancel'} name={'cancel'} label={'Cancel'} onClick={onCancel} />
                    </div>
                </div>
            }
            {
                (response || resMessage) &&
                <div>
                    <div className={'alert-box-buttons'}>
                        <UserMessage closeable={false} message={resMessage} />
                        <Button icon={'success'} name={'done'} label={'Close'} onClick={()=>{
                            callback(error, response);
                        }} />
                    </div>
                </div>
            }
        </Dialog>
    )
}

export default React.memo(Mover);


