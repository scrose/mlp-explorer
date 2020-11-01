
params = require('../../config')
utils = require('../../_utilities/data')
db = require('../../db')

// get table schema
exports.getSchema = (queryText) => {
    return async () => {
        const {rows} = await db.query(queryText, []);
        let fields = rows.reduce((a,x) => ({...a, [x.column_name]: x}), {})
        // console.log(fields);
        return fields
    }
}

// show individual survey
exports.findById = (queryText) => {
    return async (id) => {
        const { rows } = await db.query(queryText, [id])
        return rows[0]
    }
}

// find individual surveyor by other field
exports.findOne = (queryText) => {
    return async (id) => {
        const { rows } = await db.query(queryText, [id])
        return utils.groupBy(rows, 'parent_id')
    }
}

// list all surveyors (with surveys)
exports.findAll = (queryText) => {
    return async () => {
        const { rows } = await db.query(queryText, [])
        return utils.groupBy(rows, 'parent_id')
    }
}

// list all surveys for given surveyor
exports.findBySurveyor = (queryText) => {
    return async (surveyor_id) => {
        const { rows } = await db.query(queryText, [surveyor_id])
        return utils.groupBy(rows, 'parent_id')
    }
}


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
