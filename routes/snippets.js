var express = require('express');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8'));
var jf = require('jsonfile');
var router = express.Router();


router.get('/*.html', function (req, res) {
    res.sendFile('/snippets' + req.path, {'root': './'});
});


router.get('/', function (req, res) {
  var allSnippets = [];
  for (var i = 0, length = config.categories.length; i < length; i++) {
    var dataPath = './styleguide/db/' + config.categories[i].name + '.txt';

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

router.get('/duplicates', function (req, res) {
  var comparator = function (a, b) {
    return a.id - b.id;
  };

  var allSnippets = [], found = false;
  for (var i = 0, length = config.categories.length; i < length; i++) {
    var dataPath = './styleguide/db/' + config.categories[i].name + '.txt';
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

  allSnippets.sort(comparator);

  for (var i = 0, length = allSnippets.length - 1; i < length; i++) {
    if (allSnippets[i].id == allSnippets[i + 1].id) {
      res.json([allSnippets[i], allSnippets[i + 1]]);
      found = true;
      break;
    }
  }
  if (!found) {
    res.json(found);
  }
});

router.get('/category/:id', function (req, res) {
  var catId = Number(req.params.id), dataPath;
  for (var i = 0, length = config.categories.length; i < length; i++) {
    if (config.categories[i].id == catId) {
      dataPath = './styleguide/db/' + config.categories[i].name + '.txt'
    }
  }
  
  if (!dataPath) {
    res.json('Category with id: ' + catId + 'not found.');
    return;
  }

  snippets = jf.readFileSync(dataPath);

  snippets = snippets.filter(function (obj) {
    return !obj.isDeleted;
  });

  res.json(snippets);
});


router.get('/:id', function (req, res) {
  var uniques = jf.readFileSync('./styleguide/db/uniques.json');
  var id = Number(req.params.id);
  var snippets;

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    var dataPath = './styleguide/db/' + config.categories[i].name + '.txt';
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
  var dataPath;
  var uniques = jf.readFileSync('./styleguide/db/uniques.txt');
  var id, number;

  for (var i = 0, length = config.categories.length; i < length; i++) {
    if (config.categories[i].id == req.body.category) {
      dataPath = './styleguide/db/' + config.categories[i].name + '.txt'
    }
  }
  
  if (!dataPath) {
    res.json('Category with id: ' + req.body.category + ' not found.');
    return;
  }

  var datastore = jf.readFileSync(dataPath);

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
    includeJs: req.body.includeJs,
    isEdited: false,
    isDeleted: false
  }

  datastore = datastore.concat(newSnippet);
  uniques = uniques.concat(id);

  jf.writeFileSync(dataPath, datastore);
  jf.writeFileSync('./styleguide/db/uniques.txt', uniques);

  newSnippet.category = req.body.category;
  res.json(newSnippet);
});


router.put('/:id', function (req, res) {
  var uniques = jf.readFileSync('./styleguide/db/uniques.txt');
  var id = Number(req.params.id);
  var snippets, category, dataPath, newCategory;

  newCategory = Number(req.body.category);

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    dataPath = './styleguide/db/' + config.categories[i].name + '.txt';
    snippets = jf.readFileSync(dataPath);

    var desireableSnippet = snippets.filter(function (obj) {
      if (obj.id == id) {
        return obj
      }
    })[0];

    if (desireableSnippet) {
      category = i;
      break;
    }
  }

  var index = snippets.indexOf(desireableSnippet);
  snippets.splice(index, 1);

  if (newCategory != category) {
    jf.writeFileSync(dataPath, snippets);

    for (var i = 0, length = config.categories.length; i < length; i++) {
      if (config.categories[i].id == newCategory) {
        dataPath = './styleguide/db/' + config.categories[i].name + '.txt'
      }
    }
  
    if (!dataPath) {
      res.json('Category with id: ' + catId + 'not found.');
      return;
    }

    snippets = jf.readFileSync(dataPath);
  }

  var modSnippet = {
    id: id,
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    inlineCss: req.body.inlineCss,
    includeJs: req.body.includeJs,
    isEdited: true,
    isDeleted: false
  }

  snippets.push(modSnippet);

  jf.writeFileSync(dataPath, snippets);

  modSnippet.category = newCategory;

  res.json(modSnippet);
});


router.delete('/:id', function (req, res) {
  var uniques = jf.readFileSync('./styleguide/db/uniques.txt');
  var id = Number(req.params.id);
  var snippets, category, dataPath;

  if (uniques.indexOf(id) == -1) {
    res.json(false);
    return;
  }

  for (var i = 0, length = config.categories.length; i < length; i++) {
    dataPath = './styleguide/db/' + config.categories[i].name + '.txt';
    snippets = jf.readFileSync(dataPath);

    var desireableSnippet = snippets.filter(function (obj) {
      if (obj.id == id) {
        return obj
      }
    })[0];

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