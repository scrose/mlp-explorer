// File model.js

// Proper way to organize an model provider:
//
// - have all model files for Users in ./model/users
// - have all model files for Products in ./model/products
// - have your model provider module as ./model/index.js

const query = {
    // give the query a unique name
    name: 'get-station',
    text: 'SELECT * FROM user WHERE id = $1',
    values: [1],
}
