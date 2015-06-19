var express = require('express'),
  jf = require('jsonfile'),
  fs = require('fs'),
  async = require('async'),
  service = require('./scrapeService.js'),
  config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8')),

  router = express.Router();

var pushAsyncTask = function(snippets, category, uniques) {
  return function(callback) {
    service.writeOutSnippets(snippets, category, uniques, function(changedSnipps, newSnipps) {
      console.log(newSnipps);
      callback(null, {
        changedSnipps: changedSnipps,
        newSnipps: newSnipps
      });
    });
  };
};

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
      asyncTasks = [],
      report = {},
      uniques = jf.readFileSync(config.uniques, {
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
          // matches all the snippet body (<!-- snippet:start 1:1 include-js --><div id="example"></div><!-- snippet:end -->)
          filters = htmlBody.match(/<!-- snippet:start [\d\D]*?snippet:end -->/gi);
          filteredHTml = filteredHTml.concat(filters);
        }
      }
    }

    report.totalFound = filteredHTml.length;
    report.changedSnippets = [];
    report.foundNew = 0;

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
        asyncTasks.push(pushAsyncTask(snippets, category, uniques));
      }
    }

    async.series(asyncTasks, function(err, reports) {
      var index,
        len = reports.length;

      for (index = 0; index < len; index++) {
        report.changedSnippets = report.changedSnippets.concat(reports[index].changedSnipps);
        report.foundNew += reports[index].newSnipps;
      }

      jf.writeFileSync(config.uniques, uniques);

      res.json(report);
    });



  });

});

router.get('/sass', function(req, res) {
  var result = [],
    index,
    length = config.sassResources.length;

  for (index = 0; index < length; index++) {
    service.scrapeTheme(index, result);
  }

  jf.writeFileSync(config.sassData, result);

  res.json(result);
});

module.exports = router;