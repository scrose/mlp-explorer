/*!
 * MLP.Client.Components.Editor.Header
 * File: header.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MainNav from '../navigation/main.nav';
import BreadcrumbNav from '../navigation/breadcrumb.nav';
import AuthenticatedNav from '../navigation/authenticated.nav';
import Brand from '../common/brand';

/**
 * Page header component.
 *
 * @public
 */

const HeaderEditor = () => {
    return (
        <header className="page header">
            <AuthenticatedNav />
            <Brand />
            <MainNav />
            <BreadcrumbNav />
        </header>
    );
}

export default HeaderEditor;
