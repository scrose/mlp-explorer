/*!
 * MLE.Client.Components.Views.Admin
 * File: admin.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {useEffect, useState} from 'react';
import {useUser} from "../../_providers/user.provider.client";

/**
 * Render admin panel component (super-administrator users).
 *
 * @public
 */

const AdminView = () => {

    const user = useUser();
    const [logs, setLogs] = useState([]);

    // load log files
    useEffect(() => {
        const {roles} = user || {};
    }, [user]);


    return (
        <>
            <div className={'admin'}>
                {
                    (logs || []).map(log => {
                        return <div>{log}</div>
                    })
                }
            </div>
        </>
        )
};

export default React.memo(AdminView);