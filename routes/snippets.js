var express = require('express');
var router = express.Router();

router.get('/*', function (req, res) {
    console.log(__dirname);
    res.sendFile('/snippets' + req.path, {'root': './'});
});

module.exports = router;