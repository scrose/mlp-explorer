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
    'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your', 'a', 'i'];

// list of searchable tables and associated fields

const searchable = {
    projects: {
        heading: ['name'],
        required: ['name'],
        coalesce: [
            'description'
        ]
    },
    surveyors: {
        heading: ['given_names', 'last_name', 'short_name', 'affiliation'],
        required: [],
        coalesce: ['given_names', 'last_name', 'short_name', 'affiliation']
    },
    surveys: {
        heading: ['name'],
        required: ['name'],
        coalesce: [
            'historical_map_sheet'
        ]
    },
    survey_seasons: {
        heading: ['year'],
        required: ['year'],
        coalesce: [
            'geographic_coverage',
            'jurisdiction',
            'affiliation',
            'archive',
            'collection',
            'location',
            'sources',
            'notes'
        ]
    },
    stations: {
        heading: ['name'],
        required: ['name'],
        coalesce: ['nts_sheet']
    },
    modern_visits: {
        heading: ['date'],
        required: ['date'],
        coalesce: [
            'pilot',
            'rw_call_sign',
            'visit_narrative',
            'weather_narrative',
            'fn_physical_location',
            'fn_transcription_comment'
        ]
    },
    historic_captures: {
        heading: ['fn_photo_reference'],
        required: [],
        coalesce: [
            'fn_photo_reference',
            'digitization_location',
            'lac_ecopy',
            'lac_wo',
            'lac_collection',
            'lac_box',
            'lac_catalogue',
            'condition',
            'comments'
        ]
    },
    modern_captures: {
        heading: ['fn_photo_reference'],
        required: [],
        coalesce: [
            'fn_photo_reference',
            'comments'
        ]
    },
    maps: {
        type: 'metadata',
        heading: ['nts_map'],
        required: [],
        coalesce: ['nts_map', 'historic_map', 'links']
    },
    glass_plate_listings: {
        type: 'metadata',
        heading: ['container', 'plates'],
        required: [],
        coalesce: ['container', 'plates', 'notes']
    },
    participants: {
        type: 'participants',
        heading: ['date'],
        required: [],
        coalesce: ['given_names', 'last_name']
    }
};

/**
 * Full-text search of metadata.
 *
 * @public
 * @param {Array} q
 * @param {Array} filter
 * @param offset
 * @param limit
 * @return {Promise} result
 */

export const fulltext = async (q, offset, limit, filter) => {

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

        // list of searchable tables to include
        const results = {};

        // collate results for all searchable tables
        await Promise.all(
            Object.keys(searchable)
                .filter(tbl => filter.length === 0 || filter.includes(tbl))
                .map(async (tbl) => {

                let { sql, data } = searchable[tbl].type === 'metadata'
                    ? queries.search.fulltextMetadataSearch(tbl, searchable[tbl], q, offset, limit)
                    : searchable[tbl].type === 'participants'
                            ? queries.search.fulltextParticipantSearch(searchable[tbl], q, offset, limit)
                            : queries.search.fulltextNodeSearch(tbl, searchable[tbl], q, offset, limit);
                results[tbl] = await client.query(sql, data)
                    .then(res => {
                        return res.rows
                    });
            }));

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
