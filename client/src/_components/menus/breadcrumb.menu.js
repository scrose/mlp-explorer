/*!
 * MLP.Client.Components.Navigation.Breadcrumb
 * File: breadcrumb.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import { getNodeURI, filterPath, getRoot } from '../../_utils/paths.utils.client';
import { capitalize } from '../../_utils/data.utils.client';
import { getModelLabel, getNodeLabel } from '../../_services/schema.services.client';
import { useData } from '../../_providers/data.provider.client';

/**
 * Breadcrumb navigation menu component.
 *
 * @public
 */

const BreadcrumbMenu = () => {

    const api = useData();
    const { model='', view='', path=[] } = api || {};

    /**
     * Build 'breadcrumb' navigation menu from current
     * route URI path.
     *
     * @api private
     */

    const _parseRoute = function() {

        const breadcrumbs = filterPath()
            .split("/")
            .filter(item => item !== '');

        // hide breadcrumb menu on front page
        if (breadcrumbs.length === 0) return [];

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
                const slug = item.length > 25 ? '...' : item;
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
            .map(key => {

                const menuText = getNodeLabel(nodes[key]);
                const {type='', id=''} = nodes[key] || {};
                const href = getNodeURI(type, 'show', id);
                return <>
                        <Icon type={type} />&#160;&#160;<a href={href}>{menuText}</a>
                        </>
            });

    };

    // select method of extracting path elements: node path or route path
    const isNode = Object.keys(path).length > 0 && typeof path === 'object';
    const breadcrumbs = isNode ? _parseNodes(path) : _parseRoute();

    return (
        breadcrumbs ?
        <nav className={'breadcrumb'}>
            <div>
                <ul>
                    <li>
                        <a href={getRoot()}><Icon type={'logo'} /></a>
                    </li>
                    {
                        // node breadcrumb menu
                        breadcrumbs.map((item, index) => {
                                return (
                                    <li key={`item_${index}`}>{ item }</li>
                                )
                            })
                    }
                    {
                        // include menu text for new item
                        view === 'add' ? <li><span>{`New ${getModelLabel(model)}`}</span></li> : ''
                    }
                    {
                        // include menu text for new item
                        filterPath() === '/' ? <li><span>{'Home'}</span></li> : ''
                    }
                </ul>
            </div>
        </nav>
            : ''
    )
}

export default BreadcrumbMenu;
