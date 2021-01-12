/*!
 * MLP.Client.App
 * File: App.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Header from './components/common/Header';
import Navigator from './components/common/Navigator';
import Footer from './components/common/Footer';
import Viewer from './components/common/Viewer';
import ErrorBoundary from './components/common/ErrorBoundary';
import { getUserSession, setUserSession, UserContext } from './services/session.services.client';


/**
 * Core client application component.
 *
 * @public
 */

function App() {

    // create user data state for context
    const [session, setSession] = React.useState(getUserSession());

    // store user data in JS session storage
    React.useEffect(() => { console.log('App session:',session); setUserSession(getUserSession()) }, [session]);

    return (
        <UserContext.Provider value={session}>
            <div className={"page-content"}>
                    <Header />
                    <main>
                        <Navigator />
                        <ErrorBoundary>
                            <Viewer />
                        </ErrorBoundary>
                    </main>
                    <Footer />
            </div>
        </UserContext.Provider>
    );
}

export default App;