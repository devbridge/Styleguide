var express = require('express');
var request = require('request');
var jf = require('jsonfile');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8'));

var router = express.Router();

router.get('/snippets', function (req, res, next) {

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

  var findSnippet = function(snippetId, callback) {
    for (var i = 0, length = config.categories.length; i < length; i++) {
      var dataPath = '../../styleguide/db/' + config.categories[i].name + '.txt';
      var snippets = jf.readFileSync(dataPath, {throws: false}) || [];

      var desireableSnippet = snippets.filter(function (obj) {
        if (obj.id == snippetId) {
          return obj
        }
      })[0];

      if (desireableSnippet) {
        callback({ snippet: desireableSnippet, category: i });
      } 
    }
  }

  requestPages(config.scrapeUrls, function(responses) {
    var filteredHTml = [],
        results = [],
        snippetai = {},
        url,
        response,
        uniques = jf.readFileSync('../../styleguide/db/uniques.txt', {throws: false}) || [];

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
      var snippetId, categoryId;
      var domMarker = filteredHTml[i].match(/<!-- snippet:start [\d\D]*? -->/gi)[0];
      var includeJs = domMarker.match(/include-js/i);
      var extractedIds = domMarker.match(/[\d]+/g);
      var code = filteredHTml[i].match(/(?=>)[\d\D]*?(?=<!)/gi)[0];
      code = code.slice(1);
      if (extractedIds) {
        snippetId = Number(extractedIds[0]);
        //TODO: instead of 0, find undefined category id
        categoryId = extractedIds[1] ? Number(extractedIds[1]) : 0;
      }

      if (!snippetId) {
        res.status(500).send('Snippet ID is not defined! In: ' + filteredHTml[i]);
        return;
      }

      var newSnippet = {
        id: snippetId,
        name: "",
        code: code.trim(),
        description: "",
        inlineCss: "",
        includeJs: includeJs ? true : false,
        isEdited: false,
        isDeleted: false
      }

      snippetai[categoryId] = snippetai[categoryId] ? snippetai[categoryId].concat(newSnippet) : [newSnippet];
      results.push(newSnippet);
    }

    for (category in snippetai) {

      var currentDataPath;

      for (var i = 0, length = config.categories.length; i < length; i++) {
        if (config.categories[i].id == category) {
          currentDataPath = '../../styleguide/db/' + config.categories[i].name + '.txt';
          break;
        }
      }

     if (!currentDataPath) {
      res.json('Category with id: ' + catId + 'not found.');
      return;
    }

      var current = jf.readFileSync(currentDataPath, {throws: false}) || [];

      for (var i = 0, snipp = snippetai[category], length = snipp.length; i < length; i++) {

        if (uniques.indexOf(snipp[i].id) == -1) {
          uniques.push(snipp[i].id);
          current = current.concat(snipp[i]);
        } else {
          findSnippet(snipp[i].id, function(snippAndCat) {
            if (!snippAndCat.snippet.isEdited) {
              var index;
              if (snippAndCat.category == category) {
                for(var j = 0, len = current.length; j < len; j++) {
                  if (current[j].id === snippAndCat.snippet.id) {
                    index = j;
                    break;
                  }
                }

                current.splice(index, 1);
                current.push(snipp[i]);
              } else {
                var oldCatPath;

                for (var j = 0, length = config.categories.length; j < length; j++) {
                  if (config.categories[i].id == snippAndCat.category) {
                    oldCatPath = '../../styleguide/db/' + config.categories[i].name + '.txt';
                    break;
                  }
                }

                if (!oldCatPath) {
                  res.json('Category with id: ' + catId + 'not found.');
                  return;
                }

                var snippets = jf.readFileSync(oldCatPath, {throws: false}) || [];

                for(var j = 0, len = snippets.length; j < len; j++) {
                  if (snippets[j].id === snippAndCat.snippet.id) {
                    index = j;
                    break;
                  }
                }

                snippets.splice(index, 1);

                jf.writeFileSync(oldCatPath, snippets);

                current.push(snipp[i]);
              }
            } else {
              console.log('snippet was edited');
            }
          });

        }
      }

      jf.writeFileSync(currentDataPath, current);
    }

    jf.writeFileSync('../../styleguide/db/uniques.txt', uniques);

    res.json(snippetai);
  });

});

router.get('/sass', function (req, res) {
  var sass,
      result = [];
  for (var i = 0, length = config.sassResources.length; i < length; i++) {
    var rawColArray, 
        typography,
        rawTypoArray,
        unassignedColors = [],
        iterations = 0,
        assignedColors = {},
        theme = {};

    sass = fs.readFileSync(config.sassResources[i], {encoding: 'utf-8'});
    theme.name = config.sassResources[i];


    typography = sass.match(/\/\/-- typo:start[\d\D]*?typo:end --\/\//gi);
    rawTypoArray = typography[0].split('\n');
    rawTypoArray.shift();
    rawTypoArray.pop();

    //Constructing types array
    typography = [];
    for (var j = 0, len = rawTypoArray.length; j <len; j++) {
      var variableName = rawTypoArray[j].match(/\$[\d\D]*?(?=:)/gi)[0],
          value = rawTypoArray[j].match(/(?=:)[\d\D]*?(?=;)/)[0],
          weights = rawTypoArray[j].match(/\([\d\D]*?(?=\))/gi)[0];

      value = value.substring(1, value.length).trim();

      weights = weights.substring(1, weights.length);
      weights = weights.replace(/ /g,'').split(',');
      weights = weights.map(function (weight) {
        return Number(weight);
      });

      var type = {
        variable: variableName,
        value: value,
        weights: weights.sort()
      }

      typography.push(type);
    }

    theme.typography = typography;

    rawColArray = sass.match(/\/\/-- colors:start[\d\D]*?colors:end --\/\//gi);

    for (var j = 0, len = rawColArray.length; j < len; j++) {
      var colors = rawColArray[j].split('\n');

      //remove dom markers
      colors.shift();
      colors.pop();

      unassignedColors = unassignedColors.concat(colors);
    }

    //prepare array structure
    for (var j = 0, len = unassignedColors.length; j < len; j++) {
      var variableName = unassignedColors[j].match(/\$[\d\D]*?(?=:)/gi)[0],
          value = unassignedColors[j].match(/\:[\d\D]*?(?=;)/gi)[0];

      value = value.substring(1, value.length).trim();

      unassignedColors[j] = {variable: variableName, value: value}
    }

    while(iterations < config.maxSassIterations && unassignedColors.length) {
      for (var j = 0; j < unassignedColors.length; j++) {
        if (unassignedColors[j].value.indexOf('$') != 0) {
          assignedColors[unassignedColors[j].value] = [unassignedColors[j].variable];
          unassignedColors.splice(j, 1);
        } else {
          for (var color in assignedColors) {
            if (assignedColors[color].indexOf(unassignedColors[j].value) != -1) {
              assignedColors[color].push(unassignedColors[j].variable);
              unassignedColors.splice(j, 1);
              break;
            }
          }
        }
      }
      iterations++;
    }

    if (iterations == config.maxSassIterations) {
      console.log('Iterations reached max size, your variables json file could be inaccurate!\nThis means, that variable r-value is trying to show to non existing variable!');
    }

    theme.colors = assignedColors;
    result.push(theme);
  }

  jf.writeFileSync('../../styleguide/db/sassdata.txt', result);

  res.json(result);
});

module.exports = router;