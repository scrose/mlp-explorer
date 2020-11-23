/**
 * Module dependencies.
 */

const models = require('../src/services')({ verbose: true });
const params = require('../src/config');

exports.engine = 'ejs';

exports.before = function (req, res, next) {
  // check if id provided
  const id = req.params.surveyors_id;
  const queryText = 'SELECT * FROM surveys WHERE id=$1';
  console.log(req.breadcrumbs);
  if (!id) return next();
  // database query for stations ID
  process.nextTick(function () {
    models.surveyors.show(id);
    // db.query(queryText, [id], (err, result) => {
    //     if (err) {
    //         return next(err)
    //     }
    //     req.surveyor = result.rows[0];
    //     // record not found
    //     if (!req.surveyor) return next('route');
    //     // found it, move on to the routes
    //     next();
    // });
  });
};

// List of all stations
exports.list = function (req, res, next) {
  console.log(models);
  models.surveyors.list(req, res, next);
};

// List of all records
exports.show = function (req, res, next) {
  req.content = params.settings.general;
  res.render('show', {
    content: req.content,
    surveyor: req.surveyor,
  });
};

exports.edit = function (req, res, next) {
  req.content = params.settings.general;
  res.render('edit', {
    content: req.content,
    surveyor: req.surveyor,
  });
};

exports.update = function (req, res, next) {
  const body = req.body;
  req.content = params.settings.general;
  req.surveyor.name = body.surveyor.name;
  res.message('Information updated!');
  res.redirect('/surveyors/' + req.surveyor.id);
};
