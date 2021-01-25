/*!
 * MLP.Client.Components.Navigation.Breadcrumb
 * File: breadcrumb.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import { getNodeURI, getPath, getRoot } from '../../_utils/paths.utils.client';
import List from '../common/list';
import { capitalize, getEmailUser } from '../../_utils/data.utils.client';
import { useUser } from '../../_providers/user.provider.client';
import { getPageHeading } from '../../_services/schema.services.client';

/**
 * Build 'breadcrumb' navigation menu from current
 * route URI path.
 *
 * @api private
 */

const _parseRoute = function(user) {

    const breadcrumbs = getPath()
        .split("/")
        .filter(item => item !== '')
        .filter(item => item !== 'not_found');

    // hide breadcrumb menu on front page
    if (breadcrumbs.length === 0) return null;

    // reformat user email to extract user-id (if exists)
    const placeholder = user ? getEmailUser(user.email) : '...';

    // convert breadcrumbs -> components and extend array
    return breadcrumbs
        .map((item, i) => {
            // build accumulative url
            const uri = breadcrumbs
                .filter((item, j) => j <= i)
                .reduce((o, item) => {
                    o.push(item);
                    return o;
                }, [])
                .join('/');

            // create label text: use placeholder for very long slugs
            const slug = item.length > 25 ? placeholder : item;
            const label = capitalize(slug.split('_').join(' '));

            // render last item without link
            return i !== breadcrumbs.length - 1
                ? <a key={`bnav_${i}`} href={`${getRoot()}/${uri}`}>{label}</a>
                : <span key={`bnav_${i}`}>{label}</span>
        });
};

/**
 * Build 'breadcrumb' navigation menu from Node path.
 *
 * @api private
 */

const _parseNodes = function(path) {
    // iterate over sorted path keys
    return Object.keys(path)
        .sort(function(a, b){return b-a})
        .map((key, index) => {

            const menuText = getPageHeading(path[key]);
            const {type='', id=''} = path[key] || {};
            const href = getNodeURI(type, 'show', id);

            // render last item without link
            return key !== '0'
                ? <a key={index} href={href}>{menuText}</a>
                : <span key={index}>{menuText}</span>
    })
};

/**
 * Breadcrumb navigation menu component.
 *
 * @param path
 * @param data
 * @public
 */

const BreadcrumbMenu = ({path}) => {

    console.log(path)
    const user = useUser();
    const breadcrumbs = path && typeof path === 'object' ? _parseNodes(path) : _parseRoute(user);

    // add home item to breadcrumbs components
    breadcrumbs.unshift(
        <a href={getRoot()}><Icon type={'logo'} /></a>
    );

    return breadcrumbs.length > 1
        ? <nav className={'breadcrumb'}>
            <List items={breadcrumbs}/>
          </nav>
        : <></>
}

export default BreadcrumbMenu;
