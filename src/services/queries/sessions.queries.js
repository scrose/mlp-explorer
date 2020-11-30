/*!
 * MLP.API.Models.Sessions.Queries
 * File: sessions.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Initialize sessions table.
 */

export const init = `CREATE TABLE IF NOT EXISTS sessions (
                id serial NOT NULL PRIMARY KEY,
                session_id VARCHAR (255) UNIQUE NOT NULL,
                expires TIMESTAMP,
                session_data json NOT NULL);`;

/**
 * Find session by session ID.
 */

export const findById = `SELECT session_data 
            FROM sessions 
            WHERE session_id=$1::varchar
              AND expires >= TO_TIMESTAMP($2)`;

/**
 * Find all sessions.
 */

export const findAll = `SELECT * FROM sessions`;

/**
 * Upsert session.
 */

export const upsert = `INSERT INTO sessions(
            session_id,
            expires,
            session_data
            ) 
        VALUES(
            $1::varchar,
            TO_TIMESTAMP($2),
            $3::json
        )
        ON CONFLICT (session_id) DO UPDATE
        SET
            session_id = $1::varchar,
            expires = TO_TIMESTAMP($2),
            session_data = $3::json
        RETURNING *`;

/**
 * Touch session to keep from expiring.
 */

export const update = `UPDATE sessions
        SET
            expires = TO_TIMESTAMP($2), 
            session_data = $3::json
        WHERE
            session_id = $1::varchar
        RETURNING 
            session_id`;

/**
 * Delete session.
 */

export const remove = `DELETE FROM sessions 
            WHERE session_id = $1::varchar 
            RETURNING session_id`;

/**
 * Delete all sessions.
 */

export const removeAll = `DELETE FROM sessions RETURNING session_id`;

/**
 * Prune expired sessions.
 *
 * @public
 */

export const prune = `DELETE FROM sessions WHERE expires < NOW()::timestamp RETURNING session_id`;
