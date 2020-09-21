// File api.js

// Proper way to organize an sql provider:
//
// - have all sql files for Users in ./sql/users
// - have all sql files for Products in ./sql/products
// - have your sql provider module as ./sql/indexController.js

// Testing our SQL provider

// Database
const db = require('./connect')
const sql = require('./sql').users; // our sql for users;

module.exports = {
    addUser: (name, age) => db.none(sql.add, [name, age]),
    findUser: name => db.any(sql.search, name)
};
