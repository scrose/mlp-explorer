/*!
 * MLP.Core.Tests
 * File: /test/index.test.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import { expect, server, BASE_URL } from './setup.js';

describe('Index page test', () => {
  it('gets base url', (done) => {
    server
      .get(`${BASE_URL}/`)
      .expect(200)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Welcome to Express API template');
        done();
      });
  });
});

// /**
//  * Add routes
//  */
// app.get('/', function (req, res) {
//   res.send("Unit Tests")
// })
//
// // Sessions tests
// app.get('/sessions', function (req, res) {
//   sessionTests.run('delete_session', 1000)
//   sessionTests.run('set_session', 1500)
//   sessionTests.run('get_session', 1600)
//   sessionTests.run('touch_session', 2000)
//   sessionTests.run('get_session', 9000)
//   sessionTests.print(10000)
// });
//
//
// // test sessions services
// request(app)
//     .get('/sessions')
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .end(function(err, res) {
//       // console.log(res)
//       if (err) throw err;
//     });
//
// module.exports = app;
