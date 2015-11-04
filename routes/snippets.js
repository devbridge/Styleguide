var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  config = JSON.parse(fs.readFileSync('styleguide_config.txt', 'utf8')),
  jf = require('jsonfile'),
  helpers = require('./helpers.js'),
  router = express.Router();

router.get('/', function(req, res) {
  var allSnippets = [],
    snippets,
    dataPath,
    index,
    length = config.categories.length;

  for (index = 0; index < length; index++) {
    dataPath = path.join(config.database, config.categories[index].name + config.extension);

    snippets = jf.readFileSync(dataPath);
    snippets = snippets.map(helpers.mapCategory, index);
    snippets = snippets.filter(helpers.filterOutDeleted);
    allSnippets = allSnippets.concat(snippets);
  }
  res.json(allSnippets);
});

router.get('/duplicates', function(req, res) {
  var allSnippets = [],
    found = false,
    dataPath,
    snippets,
    index,
    length = config.categories.length;

  for (index = 0; index < length; index++) {
    dataPath = path.join(config.database, config.categories[index].name + config.extension);

    snippets = jf.readFileSync(dataPath);
    snippets = snippets.map(helpers.mapCategory, index);
    snippets = snippets.filter(helpers.filterOutDeleted);
    allSnippets = allSnippets.concat(snippets);
  }

  allSnippets.sort(helpers.duplicateComparator);

  for (index = 0, length = allSnippets.length - 1; index < length; index++) {
    if (allSnippets[index].id == allSnippets[index + 1].id) {
      res.json([allSnippets[index], allSnippets[index + 1]]);
      found = true;
      break;
    }
  }

  if (!found) {
    res.json(found);
  }
});

router.get('/category/:id', function(req, res) {
  var catId = Number(req.params.id),
    dataPath,
    snippets,
    index,
    length = config.categories.length;

  for (index = 0; index < length; index++) {
    if (config.categories[index].id == catId) {
      dataPath = path.join(config.database, config.categories[index].name + config.extension);
    }
  }

  if (!dataPath) {
    res.json('Category with id: ' + catId + 'not found.');
    return;
  }

  snippets = jf.readFileSync(dataPath);
  snippets = snippets.filter(helpers.filterOutDeleted);

  res.json(snippets);
});


router.get('/:id', function(req, res) {
  var uniques = jf.readFileSync(config.uniques),
    id = Number(req.params.id),
    snippets,
    dataPath,
    desireableSnippet;

  if (uniques.indexOf(id) === -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    dataPath = path.join(config.database, config.categories[i].name + config.extension);
    snippets = jf.readFileSync(dataPath);

    desireableSnippet = snippets.filter(helpers.filterOutById, id)[0];

    if (desireableSnippet) {
      desireableSnippet.category = i;
      break;
    }
  }

  res.json(desireableSnippet);
});


router.post('/', function(req, res) {
  var uniques = jf.readFileSync(config.uniques),
    dataPath,
    dataStore,
    id,
    newSnippet,
    index,
    length = config.categories.length;

  for (index = 0; index < length; index++) {
    if (config.categories[index].id === Number(req.body.category)) {
      dataPath = path.join(config.database, config.categories[index].name + config.extension);
    }
  }

  if (!dataPath) {
    res.json('Category with id: ' + req.body.category + ' not found.');
    return;
  }

  dataStore = jf.readFileSync(dataPath);

  uniques.sort();

  if (uniques.length) {
    id = uniques[uniques.length - 1] + 1;
  } else {
    id = 1;
  }

  newSnippet = {
    id: id,
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    inlineCss: req.body.inlineCss,
    includeJs: req.body.includeJs,
    isEdited: false,
    isDeleted: false
  };

  dataStore.push(newSnippet);
  uniques.push(id);

  jf.writeFileSync(dataPath, dataStore);
  jf.writeFileSync(config.uniques, uniques);

  newSnippet.category = Number(req.body.category);
  res.json(newSnippet);
});


router.put('/:id', function(req, res) {
  var uniques = jf.readFileSync(config.uniques),
    id = Number(req.params.id),
    snippets,
    category,
    dataPath,
    index,
    length = config.categories.length,
    newCategory = Number(req.body.category),
    desireableSnippet,
    modifiedSnippet;

  if (uniques.indexOf(id) === -1) {
    res.json(false);
    return;
  }

  for (index = 0; index < length; index++) {
    dataPath = path.join(config.database, config.categories[index].name + config.extension);
    snippets = jf.readFileSync(dataPath);

    desireableSnippet = snippets.filter(helpers.filterOutById, id)[0];

    if (desireableSnippet) {
      category = index;
      break;
    }
  }

  index = snippets.indexOf(desireableSnippet);
  snippets.splice(index, 1);

  if (newCategory !== Number(category)) {
    jf.writeFileSync(dataPath, snippets);

    for (index = 0; index < length; index++) {
      if (config.categories[index].id == newCategory) {
        dataPath = path.join(config.database, config.categories[index].name + config.extension);
      }
    }

    if (!dataPath) {
      res.json('Category with id: ' + newCategory + 'not found.');
      return;
    }

    snippets = jf.readFileSync(dataPath);
  }

  modifiedSnippet = {
    id: id,
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    inlineCss: req.body.inlineCss,
    includeJs: req.body.includeJs,
    isEdited: true,
    isDeleted: false
  };

  snippets.push(modifiedSnippet);
  jf.writeFileSync(dataPath, snippets);

  modifiedSnippet.category = newCategory;
  res.json(modifiedSnippet);
});


router.delete('/:id', function(req, res) {
  var uniques = jf.readFileSync(config.uniques),
    id = Number(req.params.id),
    snippets,
    category,
    dataPath,
    index,
    length = config.categories.length,
    desireableSnippet;

  if (uniques.indexOf(id) === -1) {
    res.json(false);
    return;
  }

  for (index = 0; index < length; index++) {
    dataPath = path.join(config.database, config.categories[index].name + config.extension);
    snippets = jf.readFileSync(dataPath);

    desireableSnippet = snippets.filter(helpers.filterOutById, id)[0];

    if (desireableSnippet) {
      category = index;
      break;
    }
  }

  desireableSnippet.isDeleted = true;
  desireableSnippet.isEdited = true;

  index = snippets.indexOf(desireableSnippet);
  snippets.splice(index, 1, desireableSnippet);

  jf.writeFileSync(dataPath, snippets);
  res.json(desireableSnippet);
});

module.exports = router;