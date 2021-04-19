/*!
 * MLP.API.Services.Search
 * File: search.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import pool from './db.services.js';
import queries from '../queries/index.queries.js';
import { sanitize } from '../lib/data.utils.js';

// list of commonly used words that can be excluded from search queries
const stopWords = [
    '', 'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be',
    'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can',
    'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had',
    'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into',
    'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must',
    'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
    'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than',
    'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
    'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were',
    'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your', 'a', 'i']

/**
 * Full-text search of metadata.
 *
 * @public
 * @params {Object} inputNode
 * @return {Promise} result
 */

export const fulltext = async (q, offset, limit) => {

    if (!q) return null;

    // sanitize + convert query string to term array
    q = sanitize(q.replace(/[^a-zA-Z0-9-_ ]/g, ''), 'text').split(' ');
    // filter stop words
    q = q.filter(term => !stopWords.includes(term));

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        // get all nodes for station model
        let { sql, data } = queries.search.fulltext(q, offset, limit);
        let results = await client.query(sql, data)
            .then(res => {
                return res.rows
            });

        // end transaction
        await client.query('COMMIT');

        return {
            query: q,
            results: results
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
