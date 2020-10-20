
db = require('../../db')

// show individual station
exports.findById = (queryText) => {
    return function showStations(req, res, next) {
        db.query(queryText, [req.params.stations_id], (err, result) => {
            if (err) {
                return next(err)
            }
            req.station = result.rows[0];
            console.log(req.station);
            // record not found
            if (!req.station) return next('route');
            // found it, move on to the routes
            next();
        });
    }
}

// list all stations
exports.findAll  = (queryText) => {
    return function listStations(req, res, next) {
        db.query(queryText, [], (err, result) => {
            if (err) {
                return next(err)
            }
            res.render('list', { stations: result.rows });
        });
    }
};




// Update stations
exports.update = function() {
    client.query('BEGIN', err => {
        if (shouldAbort(err)) return
        const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id'
        client.query(queryText, ['brianc'], (err, res) => {
            if (shouldAbort(err)) return
                const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
                const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
                client.query(insertPhotoText, insertPhotoValues, (err, res) => {
                    if (shouldAbort(err)) return
                    client.query('COMMIT', err => {
                        if (err) {
                            console.error('Error committing transaction', err.stack)
                        }
                        done()
                    })
                })
            })
        })
    }

