var express = require('express');
var request = require('request');
var jf = require('jsonfile');
var config = require('../config.json');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'scrape' });
});

router.get('/scrape', function(req, res, next) {

  var requestPages = function(urls, callback) {
    var results = {},
        t = urls.length,
        c = 0,
        handler = function(error, response, body) {
          var url = response.request.uri.href;
          results[url] = {
            error: error,
            response: response,
            body: body
          };
          if (++c === urls.length) {
            callback(results);
          }
        };
        while (t--) {
            request(urls[t], handler);
        }
  };

  requestPages(config.scrapeUrls, function(responses) {
    var filteredHTml = [];
    var url, response;
    for (url in responses) {
      // reference to the response object
      response = responses[url];
      // find errors
      if (response.error) {
        console.log("Error", url, response.error);
        return;
      }
       // render body
      if (response.body) {
        var filters;
        var htmlBody = response.body;
        filters = htmlBody.match(/<!-- snippet:start [\d\D]*?snippet:end -->/gi);
        filteredHTml = filteredHTml.concat(filters);
      }
    }
    var result = {
      snippets: filteredHTml
    };
    res.json(result);

    jf.writeFileSync('./db/' + config.categories[0] + '.json', result);
  });

});

module.exports = router;