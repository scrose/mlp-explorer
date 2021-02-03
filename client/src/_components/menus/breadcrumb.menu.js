/*!
 * MLP.Client.Components.Navigation.Breadcrumb
 * File: breadcrumb.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import { getNodeURI, getPath, getRoot } from '../../_utils/paths.utils.client';
import { capitalize, getEmailUser } from '../../_utils/data.utils.client';
import { getModelLabel, getNodeLabel } from '../../_services/schema.services.client';

/**
 * Breadcrumb navigation menu component.
 *
 * @param path
 * @param data
 * @public
 */

const BreadcrumbMenu = ({path, view, model}) => {

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
        const placeholder = '...';

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

    const _parseNodes = function(nodes) {
        // iterate over sorted path keys
        // sort node index descending and map to components
        return Object.keys(nodes)
            .sort(function(a, b){return b-a})
            .map((key, index) => {
                const menuText = getNodeLabel(nodes[key]);
                const {type='', id=''} = nodes[key] || {};
                const href = getNodeURI(type, 'show', id);
                const isLeaf = view !== 'add' && key !== '0'

                // render last item (leaf) without link
                return isLeaf
                    ? <span>{menuText}</span>
                    : <a href={href}>{menuText}</a>
            });

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
                        ? breadcrumbs.map((item, index) => {
                            return (
                                <li key={`item_${index}`}>{ item }</li>
                            )
                        })
                        : <li><span>{'Home'}</span></li>
                }
                {
                    // include menu text for new item
                    view === 'add' ? <li><span>{`New ${getModelLabel(model)}`}</span></li> : ''
                }
            </ul>
        </nav>
    )
}

export default BreadcrumbMenu;
