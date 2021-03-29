/*!
 * MLP.Client.App
 * File: App.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {useUser} from './_providers/user.provider.client';
import EditorApp from './_components/app/editor.app';
import ViewerApp from './_components/app/viewer.app';
import { useRouter } from './_providers/router.provider.client';
import UnavailableError from './_components/error/unavailable.error';
import { useIdleTimer } from 'react-idle-timer'
import { redirect } from './_utils/paths.utils.client';

/**
 * Core client application component.
 * - initialize idle timer
 *
 * @public
 */

export default function (props) {

    const router = useRouter();
    const user = useUser();
    const timeout = 1000 * 60 * 60;

    const handleOnIdle = event => {
        // logout user on idle timeout
        if (user) {
            console.log(`User idle for ${timeout / (1000 * 60)} minutes: logging out...`)
            redirect('/logout');
        }
    }

    const handleOnActive = event => {
        console.log('User is active', event)
        console.log('time remaining', getRemainingTime())
    }

    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: timeout,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        debounce: 500
    })

    return router.online
        ? user
            ? <EditorApp />
            : <ViewerApp />
        : <UnavailableError/>
}