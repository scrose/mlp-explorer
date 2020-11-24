/*!
 * MLP.Core.Services.Sessions
 * File: sessions.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import query from './database.js';

/**
 * Initialize sessions table.
 *
 * @public
 */

export function init() {
  return query(
    '--DROP TABLE IF EXISTS sessions;' +
      'CREATE TABLE IF NOT EXISTS sessions ( ' +
      'id serial NOT NULL PRIMARY KEY, ' +
      'session_id VARCHAR (255) UNIQUE NOT NULL, ' +
      'expires TIMESTAMP session_data json NOT NULL );',
    []
  );
}

/**
 * Find session by session ID.
 *
 * @public
 * @param {String} sid
 * @param {int} expires
 */

export function findBySessionId(sid, expires) {
  return query('SELECT session_data FROM sessions WHERE session_id=$1::varchar AND expires >= TO_TIMESTAMP($2)', [
    sid,
    expires,
  ]);
}

/**
 * Find all sessions.
 *
 * @public
 */

export function findAll() {
  return query('SELECT * FROM sessions', []);
}

/**
 * Upsert session.
 *
 * @public
 * @param {Object} data
 */

export function upsert(data) {
  return query(
    'INSERT INTO sessions(\n' +
      '    session_id,\n' +
      '    expires,\n' +
      '    session_data\n' +
      ')\n' +
      'VALUES(\n' +
      '    $1::varchar,\n' +
      '    TO_TIMESTAMP($2),\n' +
      '    $3::json\n' +
      ')\n' +
      'ON CONFLICT (session_id) DO UPDATE\n' +
      'SET\n' +
      '    session_id = $1::varchar,\n' +
      '    expires = TO_TIMESTAMP($2),\n' +
      '    session_data = $3::json\n' +
      'RETURNING *',
    [data.session_id, data.expires, data.session_data]
  );
}

/**
 * Touch session to keep from expiring.
 *
 * @public
 * @param {Object} data
 */

export function update(data) {
  return query(
    'UPDATE sessions\n' +
      'SET\n' +
      '    expires = TO_TIMESTAMP($2),\n' +
      '    session_data = $3::json\n' +
      'WHERE\n' +
      '      session_id = $1::varchar\n' +
      'RETURNING session_id',
    [data.session_id, data.expires, data.session_data]
  );
}

/**
 * Delete session.
 *
 * @public
 * @param {String} sid
 */

export function remove(sid) {
  return query('DELETE FROM sessions WHERE session_id = $1::varchar RETURNING session_id', [sid]);
}

/**
 * Delete all sessions.
 *
 * @public
 */

export function removeAll() {
  return query('DELETE FROM sessions RETURNING session_id', []);
}

/**
 * Prune expired sessions.
 *
 * @public
 */

export function prune() {
  return query('DELETE FROM sessions WHERE expires < NOW()::timestamp RETURNING session_id', []);
}