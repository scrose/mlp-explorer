/*!
 * MLP.API.Services.Queries.Schema
 * File: schema.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Get column names and data types for table.
 */

export const getColumnsInfo = `SELECT column_name, data_type
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = $1::varchar`;

/**
 * Get all of the table names in database.
 */

export const getTables = `SELECT table_name
                          FROM information_schema.tables
                         WHERE table_schema='public'
                           AND table_type='BASE TABLE';`