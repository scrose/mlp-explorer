/**
 * Module dependencies.
 */

const db = require('../../db');

exports.engine = 'ejs';

exports.before = function(req, res, next){
    const station = db.stations[req.params.id];
    if (!station) return next('route');
    req.stations = station;
    next();
};

exports.show = function(req, res, next){
    res.render('show', { station: req.station });
};

exports.edit = function(req, res, next){
    res.render('edit', { station: req.station });
};

exports.update = function(req, res, next){
    const body = req.body;
    req.station.name = body.station.name;
    res.message('Information updated!');
    res.redirect('/stations/' + req.station.id);
};