var express = require('express'),
	fs = require('fs'),
	path = require('path'),
	dbConfigPath = path.join('./', 'styleguide', 'database_config.txt'),
	databaseConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'utf8')),
	router = express.Router();

router.get('/', function(req, res) {
	var categories = JSON.parse(fs.readFileSync(databaseConfig.categories, 'utf8'));

	res.json(categories);
});

module.exports = router;