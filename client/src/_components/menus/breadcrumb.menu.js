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
import { getItemLabel } from '../../_services/schema.services.client';

/**
 * Breadcrumb navigation menu component.
 *
 * @param path
 * @param data
 * @public
 */

const BreadcrumbMenu = ({path}) => {

    const user = useUser();

    /**
     * Build 'breadcrumb' navigation menu from current
     * route URI path.
     *
     * @api private
     */

    const _parseRoute = function() {

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

                const menuText = getItemLabel(path[key]);
                const {type='', id=''} = path[key] || {};
                const href = getNodeURI(type, 'show', id);

                // render last item without link
                return key !== '0'
                    ? <a key={`menu_${index}`} href={href}>{menuText}</a>
                    : <span key={`menu_${index}`}>{menuText}</span>
            })

    };

    const breadcrumbs = path && typeof path === 'object'
        ? _parseNodes(path)
        : _parseRoute();

    return (
        <nav className={'breadcrumb'}>
            <ul>
                <li>
                    <a href={getRoot()}><Icon type={'logo'} /></a>
                </li>
                {
                    breadcrumbs.length > 0
                        ? breadcrumbs.map((key, index) => {
                            return (
                                <li key={`item_${index}`}>
                                    { breadcrumbs[key] }
                                </li>
                            )
                        })
                        : <li><span>{'Home'}</span></li>
                }
            </ul>
        </nav>
    )
}

export default BreadcrumbMenu;
