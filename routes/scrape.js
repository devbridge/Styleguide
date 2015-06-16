var express = require('express');
var jf = require('jsonfile');
var fs = require('fs');
var service = require('./scrapeService.js');
var config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8'));

var router = express.Router();

router.get('/snippets', function(req, res) {
  service.requestPages(config.scrapeUrls, function(responses) {
    var filteredHTml = [],
      filters,
      htmlBody,
      snippets = {},
      newSnippet,
      category,
      url,
      response,
      index,
      length,
      uniques = jf.readFileSync('./styleguide/db/uniques.txt', {
        throws: false
      }) || [];

    for (url in responses) {
      if (responses.hasOwnProperty(url)) {
        response = responses[url];

        if (response.error) {
          console.log("Error", url, response.error);
          return;
        }

        if (response.body) {
          htmlBody = response.body;
          filters = htmlBody.match(/<!-- snippet:start [\d\D]*?snippet:end -->/gi);
          filteredHTml = filteredHTml.concat(filters);
        }
      }
    }

    for (index = 0, length = filteredHTml.length; index < length; index++) {
      if (filteredHTml[index]) {
        newSnippet = service.buildSnippetFromHtml(filteredHTml[index], snippets);

        if (!newSnippet) {
          res.status(500).send('Something went wrong when building snippet from HTML!');
          return;
        }
      }
    }

    for (category in snippets) {
      if (snippets.hasOwnProperty(category)) {
        service.writeOutSnippets(snippets, category, uniques);
      }
    }

    jf.writeFileSync('./styleguide/db/uniques.txt', uniques);

    res.json(snippets);
  });

});

router.get('/sass', function(req, res) {
  var result = [],
    index,
    length = config.sassResources.length;

  for (index = 0; index < length; index++) {
    service.scrapeTheme(index, result);
  }

  jf.writeFileSync('./styleguide/db/sassdata.txt', result);

  res.json(result);
});

module.exports = router;