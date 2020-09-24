import http from "http";

const sys = require('sys');
const router = require('./routes/router');

// Handle your routes here, put static pages in ./public and they will server
router.register('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World');
  res.close();
});

// We need a server which relies on our router
const server = http.createServer(function (req, res) {
  let handler = router.route(req);
  handler.process(req, res);
});

// Start it up
server.listen(8000);
sys.puts('Server running');
