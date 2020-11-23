/**
 * Module dependencies.
 */

const db = require('../src/services/database');
const path = require('path');
const modelName = 'stations';
const surveyors = require('../src/services')({ type: modelName });
exports.engine = 'ejs';

exports.before = function (req, res, next) {
  // check if id provided
  const id = req.params.stations_id;
  if (!id) return next();
  // database query for stations ID
  process.nextTick(function () {
    stations.findById(req, res, next);
    // db.query('SELECT * FROM stations WHERE id=$1', [id], (err, result) => {
    //     if (err) {
    //         return next(err)
    //     }
    //     req.station = result.rows[0];
    //     console.log(req.station);
    //     // record not found
    //     if (!req.station) return next('route');
    //     // found it, move on to the routes
    //     next();
    // });
  });
};

// List of all stations
exports.list = function (req, res, next) {
  stations.findAll();
};

// List of all records
exports.show = function (req, res, next) {
  res.render('show', { station: req.station });
};

exports.create = function (req, res, next) {
  res.render('create', { station: req.station });
};

exports.edit = function (req, res, next) {
  res.render('edit', { station: req.station });
};

exports.update = function (req, res, next) {
  const body = req.body;
  req.station.name = body.station.name;
  res.message('Information updated!');
  res.redirect('/stations/' + req.station.id);
};
