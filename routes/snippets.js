var express = require('express');
var config = require('../config.json');
var jf = require('jsonfile');
var router = express.Router();

router.get('/*.html', function (req, res) {
    res.sendFile('/snippets' + req.path, {'root': './'});
});

router.get('/', function (req, res) {
  var allSnippets = [];
  for (var i = 0, length = config.categories.length; i < length; i++) {
    var dataPath = config.server.dataFolder + config.categories[i] + config.server.dataExt;
    snippets = jf.readFileSync(dataPath);
    allSnippets = allSnippets.concat(snippets);
  }

  res.json(allSnippets);
});

router.get('/:id', function (req, res) {
  var uniques = jf.readFileSync(config.server.dataFolder + 'uniques.json');
  var id = Number(req.params.id);
  var snippets;

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    var dataPath = config.server.dataFolder + config.categories[i] + config.server.dataExt;
    snippets = jf.readFileSync(dataPath);

    var desireableSnippet = snippets.filter(function (obj) {
      if (obj.id == id) {
        return obj
      }
    })[0];

    if (desireableSnippet) break;
  }

  res.json(desireableSnippet);
});

router.post('/', function (req, res) {
  var dataPath = config.server.dataFolder + config.categories[req.body.category] + config.server.dataExt;
  var datastore = jf.readFileSync(dataPath);
  var uniques = jf.readFileSync(config.server.dataFolder + 'uniques.json');
  var id, number;

  while(!id) {
    number = Math.floor(Math.random() * 1001);
    if (uniques.indexOf(number) == -1) {
      id = number;
    }
  }

  var newSnippet = {
    id: id,
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    inlineCss: req.body.inlineCss,
    isEdited: false,
    isDeleted: false
  }

  datastore = datastore.concat(newSnippet);
  uniques = uniques.concat(id);

  jf.writeFileSync(dataPath, datastore);
  jf.writeFileSync(config.server.dataFolder + 'uniques.json', uniques);

  res.json(newSnippet);
});

router.put('/:id', function(req, res) {
  var uniques = jf.readFileSync(config.server.dataFolder + 'uniques.json');
  var id = Number(req.params.id);
  var snippets, category;

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    var dataPath = config.server.dataFolder + config.categories[i] + config.server.dataExt;
    snippets = jf.readFileSync(dataPath);

    var desireableSnippet = snippets.filter(function (obj) {
      if (obj.id == id) {
        return obj
      }
    })[0];
    console.log(i);
    if (desireableSnippet) {
      category = i;
      break;
    } 
  }

  //TODO: modify element, write out

  console.log(desireableSnippet, category);
  res.json(desireableSnippet);
});

router.delete('/:id', function (req, res) {
  var uniques = jf.readFileSync(config.server.dataFolder + 'uniques.json');
  var id = Number(req.params.id);
  var snippets, category;

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    var dataPath = config.server.dataFolder + config.categories[i] + config.server.dataExt;
    snippets = jf.readFileSync(dataPath);

    var desireableSnippet = snippets.filter(function (obj) {
      if (obj.id == id) {
        return obj
      }
    })[0];
    console.log(i);
    if (desireableSnippet) {
      category = i;
      break;
    } 
  }

  //TODO: delete element from arr, write out
  res.json(desireableSnippet);
});

module.exports = router;