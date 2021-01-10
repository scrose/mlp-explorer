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
import ErrorBoundary from './components/common/ErrorBoundary'

/**
 * Core client application component.
 *
 * @public
 */

function App() {
    return (
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
    );
}

export default App;