/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Models.Surveyors
  File:         services/surveyors/index.test.js
  ------------------------------------------------------
  Data layer for Surveyors
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 6, 2020
  ======================================================
*/

utils = require('../lib/data');
db = require('./database');

let model_schema = {
  attributes: {
    model: 'surveyors',
  },
  legend: 'Surveyor Profile',
  fields: {
    published: {
      label: 'Publish',
      attributes: {
        type: 'checkbox',
      },
    },
    id: {
      label: 'ID',
      attributes: {
        type: 'hidden',
      },
    },
    last_name: {
      label: 'Last Name',
      attributes: {
        type: 'text',
        maxlength: 255,
        placeholder: '',
      },
    },
    given_names: {
      label: 'Given Names',
      attributes: {
        type: 'text',
        maxlength: 255,
        placeholder: '',
      },
    },
    short_name: {
      label: 'Abbreviation',
      attributes: {
        type: 'text',
        maxlength: 255,
        placeholder: '',
      },
    },
    affiliation: {
      label: 'Affiliation',
      attributes: {
        type: 'text',
        maxlength: 255,
        placeholder: '',
      },
    },
    created_at: {
      label: 'Created',

      attributes: {
        type: 'timestamp',
        disabled: true,
      },
    },
    updated_at: {
      label: 'Last Modified',
      attributes: {
        type: 'timestamp',
        disabled: true,
      },
    },
    fs_path: {
      label: '',
      attributes: {
        type: 'hidden',
        disabled: true,
      },
    },
  },
};

exports.schema = model_schema;

// get table schema
exports.getSchema = (queryText) => {
  return async () => {
    const { rows } = await db.query(queryText, []);
    return rows.reduce((a, x) => ({ ...a, [x.column_name]: x }), {});
  };
};

// show individual surveyor
exports.findById = (queryText) => {
  return async (id) => {
    const { rows } = await db.query(queryText, [id]);
    return rows[0];
  };
};

// find individual surveyor by other field
exports.findOne = (queryText) => {
  return async (id) => {
    const { rows } = await db.query(queryText, [id]);
    return utils.groupBy(rows, 'parent_id');
  };
};

// list all surveyors (with surveys)
exports.findAll = (queryText) => {
  return async () => {
    const { rows } = await db.query(queryText, []);
    return utils.groupBy(rows, 'parent_id');
  };
};

// Update surveyor
exports.update = (queryText) => {
  return async (data) => {
    const { rows } = await db.query(queryText, [
      data.id,
      data.published,
      data.last_name,
      data.given_names,
      data.short_name,
      data.affiliation,
    ]);
    return rows[0];
  };
};

// Update stations
// module.exports = {
//     update: (params, callback) => {
//         client.query('BEGIN', err => {
//             if (shouldAbort(err)) return
//             const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id'
//             client.query(queryText, ['brianc'], (err, res) => {
//                 if (shouldAbort(err)) return
//                 const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
//                 const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
//                 client.query(insertPhotoText, insertPhotoValues, (err, res) => {
//                     if (shouldAbort(err)) return
//                     client.query('COMMIT', err => {
//                         if (err) {
//                             console.error('Error committing transaction', err.stack)
//                         }
//                         done()
//                     })
//                 })
//             })
//         })
//     }
// }
