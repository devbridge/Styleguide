var express = require('express');
var config = require('../config.json');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(config.categories);
});

module.exports = router;