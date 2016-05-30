var _ = require('lodash');
var app = require('./app');
var http = require('http');
var fs = require('fs');
var exports = module.exports = {};
var tcpPortUsed = require('tcp-port-used');
var colors = require('colors/safe');

exports.startServer = function (options) {
	var defaultOptions = {
		styleguidePath: 'styleguide'
	};

	options = _.assign(defaultOptions, options);

	var config = JSON.parse(fs.readFileSync('./' + options.styleguidePath + '/config.txt', 'utf8'));
	var serverInstance;

	return tcpPortUsed.check(config.serverPort)
		.then(function (inUse) {
			if (!inUse) {
				app.set('styleguideConfig', config);
				app.set('port', config.serverPort);
				serverInstance = http.createServer(app);
				serverInstance.listen(config.serverPort, function () {
					console.log(colors.green('Styleguide server listening on port ' + config.serverPort));
				}).on('error', function (error) {
					if (error.code === 'EADDRINUSE') {
						console.error(colors.red('Something went wrong and server could not start'));
					}
				});
			} else {
				console.error(colors.red('Port:' + config.serverPort + ' is already in use.'));
				console.error(colors.red('Please provide another port.'));
			}

			return serverInstance;

		});
};
