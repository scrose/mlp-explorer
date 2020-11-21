/*!
 * MLP.Core.Utilities.Messages
 * File: /lib/messages.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

const express = require('express');
const res = express.response;

/**
 * Create session-persistent message.
 *
 * @public
 */

res.message = function (msg, type) {
    type = type || 'info'
    const sess = this.req.session;
    sess.messages = sess.messages || [];
    sess.messages.push({
        type: type,
        string: msg
    });
};

res.error = function (msg) {
    return this.message(msg, 'error');
};

module.exports = function (req, res, next) {
    res.locals.messages = req.session.messages || [];
    // convert message to DOM schema for node builder
    res.locals.messages.forEach(function(msg, idx) {
        this[idx] = JSON.stringify({div: {
                    attributes: {class: 'msg ' + msg.type},
                    textNode: msg.string}})
    }, res.locals.messages);
    // clear message bank
    req.session.messages = [];
    next();
};