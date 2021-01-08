/*!
 * MLP.Core.Views.Builder.Navigation
 * File: /views/builders/nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const path = require('path')
const utils = require('../../api/lib')
const config = require('../../api/config')
const {isRestricted} = require('../../api/lib/permissions')

/**
 * Build 'breadcrumb' navigation menu.
 *
 * @param req
 * @param res
 * @api public
 *
 */

module.exports.breadcrumbMenu = function(req, res) {
    let disableLink = true, linkText, viewPermissions;
    const url = req.originalUrl;
    const userName = res.locals.user ? res.locals.user.email.replace(/@.*$/,"") : 'ID';
    const homeIcon = {i: {attributes: {class: 'fa fa-lg fa-home'}}};

    // initialize link trail with home route
    let breadcrumbs = [{ li: { a: { attributes: { href: '/', class:'home' }, homeIcon}}}],
        // accumulative url
        accURL = "",
        // url array
        arrURL = utils.data.removeEmpty(url.substring(1).split("/"));
    const view = arrURL[0];

    for ( let i=0; i < arrURL.length; i++ ) {
        accURL = i !== arrURL.length-1 ? accURL + "/" + arrURL[i] : null;
        linkText = (i === 1 && arrURL[0] === 'users') ? userName : arrURL[i].toLowerCase();

        // handle user permissions
        if (arrURL[0] === 'users' && !isRestricted(res, view)) {
            disableLink = true
        }

        if (disableLink)
            breadcrumbs.push({ li: {textNode: linkText}})
        else
            breadcrumbs.push({ li: { a: { attributes:{ href: accURL }, textNode: linkText}}})

    }
    return  JSON.stringify({ul: {
            attributes: {class: "breadcrumb_menu"},
            childNodes: breadcrumbs}}
            );
};

/**
 * Build current user menu.
 *
 * @param res
 * @api public
 *
 */

module.exports.userMenu = function(res) {
    // user not logged in
    if (!res.locals.user || res.locals.user.email == null) {
        return  JSON.stringify({ul: {
                attributes: {class: "user_menu"},
                childNodes: [
                    { li: { a: {attributes: { href: "/login" }, textNode:'Sign In'}}},
                    { li: { a: {attributes: { href: "/users/register"}, textNode:'Register'}}}
                ]}});
    }
    // user is logged in
    else {
        // extract username from email
        const userName = !isRestricted(res, config.roles.superAdministrator)
            ? res.locals.user.email.replace(/@.*$/,"")
            : 'Super-Admin';
        return  JSON.stringify({ul: {
                attributes: {class: "user_menu"},
                childNodes: [
                    { li: { a: {
                        attributes: { href: path.join("/users", res.locals.user.id.toString()) },
                        textNode: userName
                    }}},
                    { li: { a: {attributes: { href: "/logout" }, textNode:'Sign Out'}}}
                ]}});
    }
};

/**
 * Build editor menu for logged-in users.
 *
 * @param res
 * @api public
 *
 */

module.exports.editorMenu = function(req, res) {

    let menu = {ul: { attributes:{ class: 'editor_menu'}, childNodes:[]}};

    if (!isRestricted(res, config.roles.administrator)) {
        menu.ul.childNodes.push({li: {a: {attributes: {href: req.uri + '/create'}, textNode: 'New'}}});
        menu.ul.childNodes.push({li: {a: {attributes: {href: req.uri + '/edit'}, textNode: 'Edit'}}});
    }

    if (!isRestricted(res, config.roles.administrator)) {
        menu.ul.childNodes.push({li: {a: {attributes: {href: req.uri + '/create'}, textNode: 'New'}}});
        menu.ul.childNodes.push({li: {a: {attributes: {href: req.uri + '/edit'}, textNode: 'Edit'}}});
    }

    menu.ul.childNodes.push({li: {a: {attributes: {href: '#'}, textNode: 'Settings'}}});
    menu.ul.childNodes.push({li: {a: {attributes: {href: '#'}, textNode: 'Help'}}});

    return JSON.stringify(menu);
}


