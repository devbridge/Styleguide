var express = require('express'),
	fs = require('fs'),
	config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8')),
	router = express.Router();

router.get('/', function(req, res) {
	res.json(config.categories);
});

module.exports = router;