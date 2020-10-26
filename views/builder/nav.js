/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Views.Builder.Navigation
  Filename:     views/builder/nav.js
  ------------------------------------------------------
  Builds navigation menus
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 26, 2020
  ======================================================
*/

'use strict';
const params = require('../../params')
const path = require('path')
const utils = require('../../utilities')


// build breadcrumb menu
module.exports.buildBreadcrumbMenu = function(url) {
    // initialize with home route
    let breadcrumbs = [{ li: { a: { attributes: { href: '/'}, textNode: params.settings.menu.frontpage}}}],
        accURL = "", // accumulative url
        arrURL = utils.data.removeEmpty(url.substring(1).split("/"));

    for ( let i=0; i < arrURL.length; i++ ) {
        accURL = i !== arrURL.length-1 ? accURL + "/" + arrURL[i] : null;
        breadcrumbs[i + 1] = { li: { a: { attributes:{ href: accURL }}, textNode: arrURL[i].toLowerCase()}};
    }
    return  JSON.stringify({ul: {
            attributes: {class: "breadcrumb_menu"},
            childNodes: breadcrumbs}}
            );
};

// build user menu
module.exports.buildUserMenu = function(user) {
    // user not logged in
    if (!user) {
        return  JSON.stringify({ul: {
                attributes: {class: "user_menu"},
                childNodes: [
                    { li: { a: {attributes: { href: "/login" }, textNode:'Login'}}},
                    { li: { a: {attributes: { href: "/register"}, textNode:'Register'}}}
                ]}});
    }
    // user is logged in
    else {
        // extract username from email
        const userName = user.email.replace(/@.*$/,"");
        return  JSON.stringify({ul: {
                attributes: {class: "user_menu"},
                childNodes: [
                    { li: { textNode: 'Signed In: ' + userName}},
                    { li: { a: {attributes: { href: path.join("/users", user.id, 'edit') }, textNode:'Edit Profile'}}}
                ]}});
    }
};


// build editor tools menu
module.exports.buildEditorMenu = function(user, req) {

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


