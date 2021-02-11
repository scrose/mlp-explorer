/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getSessionMsg, popSessionMsg } from '../../_services/session.services.client';
import { useData } from '../../_providers/data.provider.client';
import Button from './button';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {

    const [data, setData] = React.useState(getSessionMsg());
    const api = useData();

    /**
     * User login request.
     *
     * @public
     */

    const handleClose = () => {
        popSessionMsg();
        setData(null);
    }

    /**
     * Load API data.
     *
     * @public
     */

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        if (!data && api.message || getSessionMsg()) {
            setData(api.message || popSessionMsg() || {});
        }
        return () => {};
    }, [api]);

    // destructure message data
    const { msg='', type='' } = data || {};

    return (
        msg && type
            ?   <div className={`msg ${type}`}>
                    {msg}
                    <div className={'close'}>
                        <Button icon={'close'} onClick={handleClose} />
                    </div>
                </div>
            : ''
    )
}

export default React.memo(Messenger);
