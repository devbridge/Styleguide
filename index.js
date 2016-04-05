var app = require('./app');
var http = require('http');
var fs = require('fs');
var exports = module.exports = {};

exports.startServer = function(options) {
  var styleguidePath = options.styleguidePath || 'styleguide';
  var config = JSON.parse(fs.readFileSync('./' + styleguidePath + '/config.txt', 'utf8'));
  var serverInstance;
  app.set('styleguideConfig', config);
  app.set('port', config.serverPort);
  serverInstance = http.createServer(app);
  serverInstance.listen(config.serverPort, function() {
    console.log('Styleguide server listening on port ' + config.serverPort);
  }).on('error', function(error) {
    if (error.code === 'EADDRINUSE') {
      console.error('Port:' + config.serverPort + ' is already in use.');
      console.error('Please provide another port.');
    }
  });
  return serverInstance;
};