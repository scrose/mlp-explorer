/*!
 * MLP.Core.Views.Builder.Navigation
 * File: /views/builders/nav.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const params = require('../../config')
const path = require('path')
const utils = require('../../_utilities')


/**
 * Build "breadcrumb" navigation menu.
 *
 * @param {string} url
 * @public
 */

module.exports.breadcrumbMenu = function(url) {
    // initialize with home route
    let breadcrumbs = [{ li: { a: { attributes: { href: '/'}, textNode: params.settings.menu.frontpage}}}],
        accURL = "", // accumulative url
        arrURL = utils.data.removeEmpty(url.substring(1).split("/"));

    for ( let i=0; i < arrURL.length; i++ ) {
        accURL = i !== arrURL.length-1 ? accURL + "/" + arrURL[i] : null;
        // hide user ID
        const linkText = (i === 1 && arrURL[0] === 'users') ? 'ID' : arrURL[i].toLowerCase();
        breadcrumbs[breadcrumbs.length] = (accURL) ?
             { li: { a: { attributes:{ href: accURL }, textNode: linkText}}} :
             { li: {textNode: linkText}};
    }
    return  JSON.stringify({ul: {
            attributes: {class: "breadcrumb_menu"},
            childNodes: breadcrumbs}}
            );
};

// build user menu
module.exports.userMenu = function(user) {
    // user not logged in
    if (!user || user.email == null) {
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
        const userName = user.email.replace(/@.*$/,"");
        return  JSON.stringify({ul: {
                attributes: {class: "user_menu"},
                childNodes: [
                    { li: { a: {
                        attributes: { href: path.join("/users", user.id.toString(), 'edit') },
                        textNode: 'Signed in as: ' + userName
                    }}},
                    { li: { a: {attributes: { href: "/logout" }, textNode:'Sign Out'}}}
                ]}});
    }
};


// build editor tools menu
module.exports.editorMenu = function(user, req) {

    let menu = {ul: { attributes:{ class: 'editor_menu'}, childNodes:[]}};

    if (req.params.id) {
        menu.ul.childNodes.push({li: {a: {attributes: {href: uri + '/create'}, textNode: 'New'}}});
        menu.ul.childNodes.push({li: {a: {attributes: {href: uri + '/edit'}, textNode: 'Edit'}}});
    }
    menu.ul.childNodes.push({li: {a: {attributes: {href: '#'}, textNode: 'Dashboard'}}});
    menu.ul.childNodes.push({li: {a: {attributes: {href: '#'}, textNode: 'Settings'}}});
    menu.ul.childNodes.push({li: {a: {attributes: {href: '#'}, textNode: 'Help'}}});

    return JSON.stringify(menu);
}


