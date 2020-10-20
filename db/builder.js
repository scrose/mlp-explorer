/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.DataAPI
  Filename:     db/main.js
  ------------------------------------------------------
  Binding for data layer API - PostgreSQL / pg-promise.
  Key Functionality
  - Binds controllers to data layer / models.
  - Binds pg-promise database queries and data exports.
  - Options for search and node tree export data formats.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 23, 2020
  ======================================================
    TODO: PosgreSQL Connection Pooling: Option production
     pooling = pgBouncer, a lightweight connection pooler for PostgreSQL.
    https://pgdash.io/blog/pgbouncer-connection-pool.html
*/

'use strict';


