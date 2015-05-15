var express = require('express');
var config = require('../config.json');
var router = express.Router();

/* GET home page. */
router.get('/*.html', function (req, res) {
    res.sendFile('/snippets' + req.path, {'root': './'});
});

router.get('/:id', function (req, res) {
  var dbPath = '../db/';
  var result = require('../db/sample.json');
  console.log(result);
  res.json(result.sample[0]);
});

module.exports = router;