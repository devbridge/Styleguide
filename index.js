var app = require('./app');
var http = require('http');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8'));
var exports = module.exports = {};

exports.startServer = function() {
  var serverInstance;
  app.set('port', config.serverPort);
  serverInstance = http.createServer(app);
  serverInstance.listen(config.serverPort, function () {
    console.log('Styleguide server listening on port ' + config.serverPort);
  }).on('error', function (error) {
    if (error.code === 'EADDRINUSE') {
      console.error('Port:' + config.serverPort + ' is already in use.');
      console.error('Please provide another port.');
    }
  });
  return serverInstance;
};