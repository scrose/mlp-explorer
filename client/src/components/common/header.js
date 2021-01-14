/*!
 * MLP.Client.Components.Common.Header
 * File: Header.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';import {schema} from '../../schema';
import { getRoot } from '../../services/api.services.client';
import { useUser } from '../../context/user.context.client';

/**
 * User navigation menu component.
 *
 * @public
 */

function UserMenu() {

    // user login navigation
    const user = useUser();
    function handleLogin() {
        console.log('Token in login button:', user)
        const action = user ? 'logout' : 'login';
        const toggle = {
            login: () => window.location.replace("/login"),
            logout: () => window.location.replace("/logout")
        }
        toggle[action]();
    }
    return (
        <nav className={'menu user'}>
            <button onClick={handleLogin}>
                    <span>{user ? 'Logout' : 'Login'}</span>
            </button>
        </nav>
    );
}

/**
 * Navigation menu component.
 *
 * @public
 * @param id
 */

const NavMenu = ({data}) => {
    const {email} = data;
    return (
        <nav className={`menu user`}>{email}</nav>
    )
}

/**
 * Page header component.
 *
 * @public
 */

const Header = () => {

    // Page title
    const pageTitle = `${schema.main.appName}: ${schema.main.projectName}`;
    // get current path
    const rootURL = getRoot();

    return (
        <header className="page-header">
            <UserMenu />
            <h1>
                <a href="/">{pageTitle}</a>
            </h1>
            <nav id="main_menu">
                <ul className="main_menu">
                    <li><a href={rootURL}>Home</a></li>
                    <li><a href={rootURL}>About</a></li>
                    <li><a href={rootURL}>User Guide</a></li>
                    <li><a href={rootURL}>Tools</a></li>
                    <li><a href={rootURL}>MLP Website</a></li>
                    <li><a href={rootURL}>Help</a></li>
                </ul>
            </nav>
            <nav id="breadcrumb_menu"></nav>
            <nav id="editor_menu"></nav>
        </header>
    );
}

export default Header;
