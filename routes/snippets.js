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

    snippets = snippets.map(function (obj) {
      obj.category = i;
      return obj;
    });

    snippets = snippets.filter(function (obj) {
      return !obj.isDeleted;
    });

    allSnippets = allSnippets.concat(snippets);
  }

  res.json(allSnippets);
});

router.get('/category/:id', function (req, res) {
  var catId = Number(req.params.id);
  var dataPath = config.server.dataFolder + config.categories[catId] + config.server.dataExt;

  snippets = jf.readFileSync(dataPath);

  snippets = snippets.filter(function (obj) {
    return !obj.isDeleted;
  });

  res.json(snippets);
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

    if (desireableSnippet) {
      desireableSnippet.category = i;
      break;
    } 
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


router.put('/:id', function (req, res) {
  var uniques = jf.readFileSync(config.server.dataFolder + 'uniques.json');
  var id = Number(req.params.id);
  var snippets, category, dataPath, newCategory;

  newCategory = Number(req.body.category);

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    dataPath = config.server.dataFolder + config.categories[i] + config.server.dataExt;
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

  var index = snippets.indexOf(desireableSnippet);
  snippets.splice(index, 1);

  if (newCategory != category) {
    jf.writeFileSync(dataPath, snippets);
    dataPath = config.server.dataFolder + config.categories[newCategory] + config.server.dataExt;
    snippets = jf.readFileSync(dataPath);
  }

  var modSnippet = {
    id: id,
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    inlineCss: req.body.inlineCss,
    isEdited: true,
    isDeleted: false
  }

  snippets.push(modSnippet);

  jf.writeFileSync(dataPath, snippets);

  res.json(modSnippet);
});


router.delete('/:id', function (req, res) {
  var uniques = jf.readFileSync(config.server.dataFolder + 'uniques.json');
  var id = Number(req.params.id);
  var snippets, category, dataPath;

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    dataPath = config.server.dataFolder + config.categories[i] + config.server.dataExt;
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

  desireableSnippet.isDeleted = true;

  var index = snippets.indexOf(desireableSnippet);
  snippets.splice(index, 1, desireableSnippet);

  jf.writeFileSync(dataPath, snippets);
  res.json(desireableSnippet);
});

module.exports = router;