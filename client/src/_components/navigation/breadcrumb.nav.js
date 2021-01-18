/*!
 * MLP.Client.Components.Navigation.Breadcrumb
 * File: breadcrumb.nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import { getPath, getRoot } from '../../_utils/paths.utils.client';
import List from '../common/list';

/**
 * Build 'breadcrumb' navigation menu.
 *
 * @api private
 */

const _getBreadcrumbs = function(user) {

    const home = <a href={getRoot()}><Icon type={'home'} /></a>;
    const breadcrumbs = getPath()
        .split("/")
        .filter(item => item !== '')
        .filter(item => item !== 'not_found');

    // hide breadcrumb menu on front page
    if (breadcrumbs.length === 0) return null;

    // reformat user email to extract user-id (if exists)
    const userName = user ? user.email.replace(/@.*$/,"") : 'UserID';

    // convert breadcrumbs -> components and extend array
    let breadcrumbComponents = breadcrumbs
        .map((item, i) => {
            // build accumulative url
            const uri = breadcrumbs
                .filter((item, j) => i === j )
                .reduce((o, item) => {o.push(item); return o}, [])
                .join('/');

            // create label text
            const label = item.split('_').join(' ').toLowerCase();

            // render last item without link
            return i !== breadcrumbs.length - 1
                ? <a key={`bnav_${i}`} href={`${getRoot()}/${uri}`}>{label}</a>
                : <span key={`bnav_${i}`} >{label}</span>
        })

    // add home item to breadcrumbs components
    breadcrumbComponents.unshift(home);

    return breadcrumbComponents;
};

/**
 * Breadcrumb navigation menu component.
 *
 * @public
 */

const BreadcrumbNav = ({user}) => {
    const breadcrumbs = _getBreadcrumbs(user);
    return breadcrumbs
        ? <nav className={'breadcrumb'}><List items={breadcrumbs}/></nav>
        : <></>
}

export default BreadcrumbNav;
