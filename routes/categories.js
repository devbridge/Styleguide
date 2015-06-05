var express = require('express');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('../../styleguide_config.txt', 'utf8'));
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(config.categories);
});

module.exports = router;