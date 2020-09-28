/**
 * Module dependencies.
 */

const db = require('../../db');

exports.engine = 'ejs';

// Check for ID value to display single record
exports.before = function(req, res, next){
    // check if id provided
    const id = req.params.users_id;
    if (!id) return next();
    // database query for users ID
    process.nextTick(function(){
        req.user = db.query('SELECT * FROM users WHERE id=$1', [id], (err, res) => {
            if (err) {
                return next(err)
            }
        });
        // cant find that users
        if (!req.user) return next('route');
        // found it, move on to the routes
        next();
    });
};

// List of all users
exports.list = function(req, res, next){
    db.query('SELECT * FROM users', [], (err, result) => {
        if (err) {
            return next(err)
        }
        res.render('list', { users: result.rows });
    });
};

// Edit users record [ID]
exports.edit = function(req, res, next){
    res.render('edit', { user: req.user });
};

// Show users record [ID]
exports.show = function(req, res, next){
    res.render('show', { user: req.user });
};

// Update users record [ID]
exports.update = function(req, res, next){
    var body = req.body;
    req.user.name = body.user.name;
    res.message('Information updated!');
    res.redirect('/users/' + req.user.id);
};