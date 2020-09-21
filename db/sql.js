// File sql.js

// Proper way to organize an sql provider:
//
// - have all sql files for Users in ./sql/users
// - have all sql files for Products in ./sql/products
// - have your sql provider module as ./sql/indexController.js

const QueryFile = require('pg-promise').QueryFile;
const path = require('path');

// Helper for linking to external query files:
function sql(file) {
    const fullPath = path.join(__dirname, file); // generating full path;
    return new QueryFile(fullPath, {minify: true});
}

module.exports = {
    // external queries for Users:
    users: {
        add: sql('users/create.sql'),
        search: sql('users/search.sql'),
        report: sql('users/report.sql'),
    },
    // external queries for Products:
    products: {
        add: sql('products/add.sql'),
        quote: sql('products/quote.sql'),
        search: sql('products/search.sql'),
    }
};
