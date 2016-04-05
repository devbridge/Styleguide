var request = require('request'),
  path = require('path'),
  jf = require('jsonfile'),
  async = require('async'),
  helpers = require('./helpers.js'),
  fs = require('fs'),

  exports = module.exports = {};

var findSnippet = function(snippetId, callback, config) {
  var dataPath,
    snippets,
    desireableSnippet,
    index,
    length = config.categories.length;
  for (index = 0; index < length; index++) {
    dataPath = path.join(config.database, config.categories[index].name + config.extension);
    snippets = jf.readFileSync(dataPath, {
      throws: false
    }) || [];
    desireableSnippet = snippets.filter(helpers.filterOutById, snippetId)[0];
    if (desireableSnippet) {
      callback({
        snippet: desireableSnippet,
        category: index
      });
      break;
    }
  }
};

exports.requestPages = function(urls, callback) {
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

exports.buildSnippetFromHtml = function(filteredHTml, snippets) {
  //matches <!-- snippet:start 5:6 --> in string. only to take dom marker.
  var domMarker = filteredHTml.match(/<!-- snippet:start [\d\D]*? -->/gi)[0],
    //matches if there is include-js in domMarker
    includeJs = domMarker.match(/include-js/i),
    //matches all numbers, that are in domMarker (first will be snippet id, second if exists - category id)
    extractedIds = domMarker.match(/[\d]+/g),
    //matches from first > to <!, including >. Used to trim off dom markers from html.
    code = filteredHTml.match(/(?=>)[\d\D]*?(?=<!)/gi)[0],
    snippetId,
    categoryId,
    newSnippet;

  code = code.slice(1);
  if (extractedIds) {
    snippetId = Number(extractedIds[0]);
    categoryId = extractedIds[1] ? Number(extractedIds[1]) : 0;
  }

  if (!snippetId) {
    console.log('Snippet ID is not defined! In: ' + filteredHTml);
    return false;
  }

  newSnippet = {
    id: snippetId,
    name: '',
    code: code.trim(),
    description: '',
    inlineCss: '#snippet { \n  \n}',
    includeJs: includeJs ? true : false,
    isEdited: false,
    isDeleted: false
  };

  snippets[categoryId] = snippets[categoryId] ? snippets[categoryId].concat(newSnippet) : [newSnippet];
  return newSnippet;
};

exports.writeOutSnippets = function(snippets, category, uniques, callback, config) {
  var dataPath,
    snippet,
    dataStore,
    index,
    nestedIndex,
    nestedLen,
    oldCategoryPath,
    oldCatSnippets,
    foundSnippetCallback,
    asyncTasks = [],
    changedSnippets = [],
    newSnippsFound = 0,
    length = config.categories.length;

  for (index = 0; index < length; index++) {
    if (config.categories[index].id === Number(category)) {
      dataPath = path.join(config.database, config.categories[index].name + config.extension);
      break;
    }
  }

  if (!dataPath) {
    console.log('Category with id: ' + category + ' not found.');
    return false;
  }

  dataStore = jf.readFileSync(dataPath, {
    throws: false
  }) || [];

  snippet = snippets[category];

  foundSnippetCallback = function(snippetAndCategory, changedSnippets, snippetToWriteOut, cb) {
    if (!snippetAndCategory.snippet.isEdited) {
      if (snippetAndCategory.category == category) {
        for (nestedIndex = 0, nestedLen = dataStore.length; nestedIndex < nestedLen; nestedIndex++) {
          if (dataStore[nestedIndex].id == snippetAndCategory.snippet.id) {
            break;
          }
        }
        dataStore.splice(nestedIndex, 1);
        dataStore.push(snippetToWriteOut);
        if (snippetAndCategory.snippet.code.localeCompare(snippetToWriteOut.code) !== 0) {
          changedSnippets.push(snippetToWriteOut.id);
        }
      } else {
        for (nestedIndex = 0, nestedLen = config.categories.length; nestedIndex < nestedLen; nestedIndex++) {
          if (config.categories[nestedIndex].id == snippetAndCategory.category) {
            oldCategoryPath = path.join(config.database, config.categories[nestedIndex].name + config.extension);
            break;
          }
        }

        oldCatSnippets = jf.readFileSync(oldCategoryPath, {
          throws: false
        }) || [];

        for (nestedIndex = 0, nestedLen = oldCatSnippets.length; nestedIndex < nestedLen; nestedIndex++) {
          if (oldCatSnippets[nestedIndex].id == snippetAndCategory.snippet.id) {
            break;
          }
        }
        oldCatSnippets.splice(nestedIndex, 1);
        dataStore.push(snippetToWriteOut);
        changedSnippets.push(snippetToWriteOut.id);

        jf.writeFileSync(oldCategoryPath, oldCatSnippets);
      }
      cb();
    } else {
      console.log('Snippet was edited from UI. Snippet ID: ' + snippetToWriteOut.id);
      cb();
    }
  };

  var createFuncContext = function(snippetToSearch) {
    return function(cb) {
      findSnippet(snippetToSearch.id, function(snippetAndCategory) {
        foundSnippetCallback(snippetAndCategory, changedSnippets, snippetToSearch, cb);
      }, config);
    };
  };

  for (index = 0, length = snippet.length; index < length; index++) {
    if (uniques.indexOf(snippet[index].id) === -1) {
      uniques.push(snippet[index].id);
      dataStore.push(snippet[index]);
      newSnippsFound++;
    } else {
      asyncTasks.push(createFuncContext(snippet[index]));
    }
  }

  async.parallel(asyncTasks, function(err, stuff) {
    callback(changedSnippets, newSnippsFound);
    jf.writeFileSync(dataPath, dataStore);
  });
};