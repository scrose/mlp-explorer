/*!
 * MLP.API.Services.Queries
 * File: queries.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find all records in table.
 *
 * @param {String} table
 */

export function getAll(table) {
    return `SELECT * FROM ${table};`;
}

/**
 * Find record by ID.
 *
 * @param {String} table
 * @param {Object} args
 */

export function select(table, args={col:'id', datatype:'integer'}) {
    return `SELECT * FROM ${table} WHERE "${args.col}" = $1::${args.datatype};`;
}

/**
 * Update record data in table.
 *
 * @param {Object} model
 * @param {int} i
 */

export function update(model, i=1) {

    // zip values with column names
    const args = model.fields.map(function(field, key) {
        return [field, `${i++}::${model.fields[key].datatype}`].join("=");
    });

    return `UPDATE "${model.name}" 
            SET ${args.join(",")} 
            WHERE id = ${i++}::integer
            RETURNING *;`;

}

/**
 * Insert new record.
 *
 * @param {Object} model
 * @param {int} i
 */

export function insert(model, i=1) {

    // get columns and prepared value placeholders
    const cols = model.fields.map(function(field, key) {
        return field;
    });
    const vals = model.fields.map(function(field, key) {
        return `${i++}::${model.fields[key].datatype}`;
    });

    return `INSERT INTO ${model.name} (${cols.join(",")})
            VALUES (${vals.join(",")})
            RETURNING *;`;
}

/**
 * Delete record.
 *
 * @param {String} table
 * @param {Object} args
 */

export function remove(table,  args={col:'id', datatype:'integer'}) {
    return `DELETE FROM ${table} 
            WHERE "${args.col}" = $1::${args.datatype} 
            RETURNING *;`;
}

/**
 * Build transaction. Create plpgsql function to run prepared statements.
 *
 * @param {String} fname
 * @param {Array} statements
 * @param {Array} params
 * @return {String} sql query
 * @public
 */

export function transact(fname, statements, params) {

    // zip params with datatypes
    let paramsTyped = params.cols.map(function(col, key) {
        return [col, params.datatypes[key]].join(" ");
    });

    return `
            BEGIN;
            CREATE OR REPLACE FUNCTION ${fname}(${paramsTyped.join(",")}) RETURNS void AS 
            $$
            BEGIN
                DROP FUNCTION ${fname}(${params.datatypes.join(",")};
                ${statements.join(";\n")};
            END;
            $$ 
            LANGUAGE plpgsql;
            COMMIT;
            SELECT ${fname}($1::varchar, $2::varchar, $3::varchar, $4::varchar);
            `
}



