var app = require('./app');
var http = require('http');
var exports = module.exports = {};

exports.startServer = function(port) {
    app.set('port', port);
    serverInstance = http.createServer(app);
    serverInstance.listen(port, function () {
      console.log('Styleguide server listening on port ' + port);
    }).on('error', function (error) {
      if (error.code === 'EADDRINUSE') {
        console.error('Port:' + port + ' is already in use.');
        console.error('Please provide another port.');
      }
    });
  
  return serverInstance;
};