/*!
 * MLP.Client.App
 * File: App.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useIdleTimer } from 'react-idle-timer'
import {useUser} from './_providers/user.provider.client';
import EditorApp from './_components/app/editor.app';
import ViewerApp from './_components/app/viewer.app';
import { useRouter } from './_providers/router.provider.client';
import UnavailableError from './_components/error/unavailable.error';
import { redirect } from './_utils/paths.utils.client';
import { popSessionMsg } from './_services/session.services.client';

/**
 * Core client application component.
 * - initialize user idle timer
 *
 * @public
 */

export default function App() {

    const router = useRouter();
    const user = useUser();
    console.log(user)
    const timeout = 1000 * 60 * 60;

    const handleOnIdle = () => {
        // logout user on idle timeout
        if (user) {
            console.log(`User idle for ${timeout / (1000 * 60)} minutes: logging out...`);
            popSessionMsg();
            redirect('/logout');
        }
    }

    const handleOnActive = e => {
        console.log('User is active.');
        console.log('Time remaining in session (minutes):', getRemainingTime() / (1000 * 60));
    }

    // retrieve remaining active time
    const { getRemainingTime } = useIdleTimer({
        timeout: timeout,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        debounce: 500
    });

    return router.online
        ? user
            ? <EditorApp />
            : <ViewerApp />
        : <UnavailableError/>
}