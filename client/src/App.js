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

/**
 * Core client application component.
 * - initialize user idle timer
 *
 * @public
 */

export default function App() {

    const router = useRouter();
    const user = useUser();

    return router.online
        ? user
            ? <EditorApp />
            : <ViewerApp />
        : <UnavailableError/>
}