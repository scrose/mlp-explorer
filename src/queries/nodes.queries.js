/*!
 * MLP.API.Services.Queries.Nodes
 * File: nodes.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as defaults from './defaults.queries.js';

/**
 * Query: Get all node types listed.
 *
 * @return {Object} query binding
 */

export function types() {
    return {
        sql: `SELECT *
              FROM node_types;`,
        data: [],
    };
}

/**
 * Query: Get all node relations listed.
 *
 * @return {Object} query binding
 */

export function relations() {
    return {
        sql: `SELECT *
              FROM node_relations;`,
        data: [],
    };
}

/**
 * Generate query: Retrieve node entry for given ID.
 *
 * @param {integer} id
 * @return {Function} query function / null if no node
 * @public
 */

export function select(id) {
    return {
        sql: `SELECT * 
                FROM nodes 
                WHERE id = $1::integer`,
        data: [id]
    }
}

/**
 * Generate query: Find all records in nodes table for
 * requested model type.
 *
 * @param {Object} model
 * @return {Function} query
 * @public
 */

export function selectByModel(model) {
    return {
        sql: `SELECT * 
                FROM nodes
                WHERE nodes.type=$1::varchar`,
        data: [model],
    };
}

/**
 * Generate query: Retrieve dependent nodes by owner id.
 *
 * @return {Function} query function
 * @public
 */

export function selectByOwner(id) {
    const sql = `SELECT * 
            FROM nodes 
            WHERE owner_id = $1::integer`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Generate query: Insert node entry for given item
 *
 * @param {Object} node
 * @return {Function} query function / null if no node
 * @public
 */

export function insert(node) {
    return defaults.insert(node);
}

/**
 * Generate query: Update node entry for given item
 *
 * @param {Object} node
 * @return {Function} query function / null if no node
 * @public
 */

export function update(node) {
    return defaults.update(node);
}

/**
 * Generate query: Delete node entry for given item
 *
 * @param {Object} node
 * @return {Function} query function / null if no node
 * @public
 */

export function remove(node) {
    return defaults.remove(node);
}