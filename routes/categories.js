var express = require('express');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8'));
var router = express.Router();

router.get('/', function(req, res) {
	res.json(config.categories);
});

module.exports = router;