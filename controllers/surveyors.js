/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Contollers.Surveyors
  Filename:     controllers/surveyors/main.js
  ------------------------------------------------------
  Parses and translates user data into application
  executions and responds.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 2, 2020
  ======================================================
*/

const utils = require('../utilities/data')
const path = require('path')
const modelName = 'surveyors'
const surveyors = require('../models')({ type: modelName });
const surveys = require('../models')({ type: 'surveys' });
const params = require('../params')
const forms = require('../views/builder/forms')
const messages = require('../views/builder/messages')

exports.engine = 'ejs';

// preliminary handler
exports.before = async (req, res, next) => {
    // Add boilerplate content
    req.content = params.settings.general;
    // check if id provided
    req.content.id = req.params.surveyors_id ? req.params.surveyors_id : null;
    req.content.uri = modelName;
    // load schema
    // req.schema = await surveyors.getSchema()
    next();
};


// list all surveyors
exports.list = async (req, res, next) => {
    const result = await surveyors.findAll()
    res.render('list', {
        content: req.content,
        breadcrumb_menu: req.breadcrumbs,
        surveyors: result
    });
};

// show individual surveyor
exports.show = async (req, res, next) => {
    const surveyor_result = await surveyors.findById(req.params.surveyors_id);
    const surveys_result = await surveys.findBySurveyor(req.params.surveyors_id)
    // Handle empty response -> return to full list
    if (!surveyor_result || utils.isEmpty(surveyor_result)) res.redirect('/' + modelName + '/')
    else {
        // Render view
        res.render('show', {
            content: req.content,
            breadcrumb_menu: req.breadcrumbs,
            surveyor: surveyor_result,
            surveys: surveys_result[req.params.surveyors_id]
        });
    }
};

// edit surveyor data
exports.edit = async (req, res, next) => {
    await surveyors.findById(req.params.surveyors_id)
        .then((result) => {
            res.statusCode = 200;
            res.statusMessage = null;
            res.render('edit', {
                message: null,
                model: modelName,
                content: req.content,
                breadcrumb_menu: req.breadcrumbs,
                form: forms.create({
                        submitURL: req.url,
                        cancelURL: path.join('/', modelName, req.params.surveyors_id),
                        method: 'POST'
                    },
                    surveyors.schema, result)
            });
        })
        .catch((err) => {
            res.statusCode = 400;
            res.statusMessage = "Update Failed:" + err;
            next();
        });
};

// update surveyor data
exports.update = async (req, res, next) => {
    await surveyors.update(req.body)
        .then((result) => {
            res.statusCode = 200;
            res.statusMessage = "Updated successfully.";
            res.render('edit', {
                message: messages.create('info', res.statusMessage),
                model: modelName,
                content: req.content,
                breadcrumb_menu: req.breadcrumbs,
                form: forms.create({
                    submitURL: req.url,
                    cancelURL: path.join('/', modelName, req.content.id),
                    method: 'POST'
                    },
                    surveyors.schema, result)
            });
        })
        .catch((err) => {
            console.log(err)
            res.statusCode = 400;
            res.statusMessage = "Update Failed: " + err;
            res.redirect(path.join('/', modelName, req.params.surveyors_id));
        });
};

// create new surveyor
exports.create = [
// // Validate that the name field is not empty.
// validator.body('name', 'Genre name required').trim().isLength({ min: 1 }),
//
// // Sanitize (escape) the name field.
// validator.sanitizeBody('name').escape(),

    (req, res, next) => {

// Extract the validation errors from a request.
//         const errors = validator.validationResult(req);
        var errors = []

        // Create a surveyor object with escaped and trimmed data.
        var surveyor = new Surveyor(
            { name: req.body.name }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('create', {
                content: req.content,
                breadcrumb_menu: req.breadcrumbs,
                surveyor: req.surveyor
            });
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec( function(err, found_genre) {
                    if (err) { return next(err); }

                    if (found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    }
                    else {

                        surveyor.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        });

                    }

                });
        }
    }
];
