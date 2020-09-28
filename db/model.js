// File model.js

// Proper way to organize an model provider:
//
// - have all model files for Users in ./model/users
// - have all model files for Products in ./model/products
// - have your model provider module as ./model/index.js

const QueryFile = require('pg');
const path = require('path');

// Helper for linking to external query files:
function model(file) {
    const fullPath = path.join(__dirname, file); // generating full path;
    return new QueryFile(fullPath, {minify: true});
}

module.exports = {
    // external queries for Users:
    users: {
        create: model('users/create.model'),
        edit: model('users/search.model'),
        update: model('users/report.model'),
    },
    // external queries for Stations:
    stations: {
        add: model('products/add.model'),
        quote: model('products/quote.model'),
        search: model('products/search.model'),
    }
};
