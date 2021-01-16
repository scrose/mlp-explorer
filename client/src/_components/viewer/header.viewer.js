/*!
 * MLP.Client.Components.Viewer.Header
 * File: header.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import BreadcrumbNav from '../navigation/breadcrumb.nav';
import MainNav from '../navigation/main.nav';
import UnauthenticatedNav from '../navigation/unauthenticated.nav';
import Brand from '../common/brand';

/**
 * Page header component.
 *
 * @public
 */

const HeaderViewer = () => {
    return (
        <header className="page header">
            <UnauthenticatedNav />
            <Brand />
            <MainNav />
            <BreadcrumbNav />
        </header>
    );
}

export default HeaderViewer;
