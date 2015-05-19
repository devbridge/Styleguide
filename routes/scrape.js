var express = require('express');
var request = require('request');
var jf = require('jsonfile');
var config = require('../config.json');

var router = express.Router();

router.get('/', function(req, res, next) {

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

  var findSnippet = function(snippetId) {
    for (var i = 0, length = config.categories.length; i < length; i++) {
      var dataPath = config.server.dataFolder + config.categories[i] + config.server.dataExt;
      snippets = jf.readFileSync(dataPath);

      var desireableSnippet = snippets.filter(function (obj) {
        if (obj.id == snippetId) {
          return obj
        }
      })[0];

      if (desireableSnippet) {
        return { snippet: desireableSnippet, category: i };
      } 
    }
  }

  requestPages(config.scrapeUrls, function(responses) {
    var filteredHTml = [], results = [];
    var snippetai = {}
    var url, response, uniques = jf.readFileSync(config.server.dataFolder + 'uniques.json');
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

    //build snippets
    for (var i = 0, length = filteredHTml.length; i < length; i++) {
      var snippetId = filteredHTml[i].match(/[\d]+/g);
      var categoryId = filteredHTml[i].match(/(?=:).[\d]+/g);

      if (!snippetId) {
        res.status(500).send('Snippet ID is not defined! In: ' + filteredHTml[i]);
        return;
      }

      snippetId = Number(snippetId[0]);

      categoryId = categoryId ? Number(categoryId[0].slice(1)) : config.categories.indexOf('undefined');

      var newSnippet = {
        id: snippetId,
        name: "",
        code: filteredHTml[i],
        description: "",
        inlineCss: "",
        isEdited: false,
        isDeleted: false
      }

      snippetai[categoryId] = snippetai[categoryId] ? snippetai[categoryId].concat(newSnippet) : [newSnippet];
      results.push(newSnippet);
    }

    for (category in snippetai) {

      var current = jf.readFileSync(config.server.dataFolder + config.categories[category] + config.server.dataExt, {throws: false}) || [];

      for (var i = 0, snipp = snippetai[category], length = snipp.length; i < length; i++) {
        console.log('entered for', length, i);
        if (uniques.indexOf(snipp[i].id) == -1) {
          uniques.push(snipp[i].id);
          current = current.concat(snipp[i]);
        } else {
          var snippAndCat = findSnippet(snipp[i].id);
          if (!snippAndCat.snippet.isEdited) {
            snippets = jf.readFileSync(config.server.dataFolder + config.categories[snippAndCat.category] + config.server.dataExt);

            var index = snippets.indexOf(desireableSnippet);
            snippets.splice(index, 1);

            jf.writeFileSync(config.server.dataFolder + config.categories[snippAndCat.category] + config.server.dataExt, snippets);

            current.push(snipp[i]);
          }
        }
      }

      jf.writeFileSync(config.server.dataFolder + config.categories[category] + config.server.dataExt, current);
    }

    jf.writeFileSync(config.server.dataFolder + 'uniques.json', uniques);

    res.json(snippetai);
  });

});

module.exports = router;