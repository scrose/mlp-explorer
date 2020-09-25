/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       core.router.user
  Filename:     routes/user.js
  Description:  Receives HTTP request data and routes to
                appropriate controller for processing.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 21, 2020
  ======================================================
*/

const Router = require('express-promise-router')
const db = require('../db')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()
// export our router to be mounted by the parent application
module.exports = router
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT * FROM user WHERE id = $1', [id])
  res.send(rows[0])
})


module.exports = router;
