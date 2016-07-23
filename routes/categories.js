var _ = require('lodash'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	jf = require('jsonfile'),
	router = express.Router();

router.get('/', function(req, res) {
	var config = req.app.get('styleguideConfig'),
		categories = JSON.parse(fs.readFileSync(config.categories, 'utf8'));

	res.json(categories);
});

router.post('/', function (req, res) {
	var config = req.app.get('styleguideConfig'),
		categories = JSON.parse(fs.readFileSync(config.categories, 'utf8')),
		uniqueIds = _.map(categories, 'id'),
		newCategory = {},
		id = 1;

	uniqueIds.sort(function (a, b) {
		return a - b;
	});

	if (uniqueIds.length) {
		id = uniqueIds[uniqueIds.length - 1 ] + 1;
	}

	newCategory = {
		id: id,
		name: req.body.name
	};

    _checkForDupes(categories, newCategory);

	categories.push(newCategory);

	jf.writeFileSync(config.categories, categories);
	jf.writeFileSync(path.join(config.database, newCategory.name + config.extension), []);

	res.json(newCategory);
});

router.put('/:id', function(req, res) {
	var config = req.app.get('styleguideConfig'),
		categories = JSON.parse(fs.readFileSync(config.categories, 'utf8')),
		uniqueIds = _.map(categories, 'id'),
		id = Number(req.params.id),
		categoryIndex = uniqueIds.indexOf(id),
		category = categories[categoryIndex],
		modifiedCategory,
		oldCategoryPath = path.join(config.database, category.name + config.extension),
		newCategoryPath;

	if (categoryIndex === -1) {
		res.json(false);
		return;
	}

	modifiedCategory = {
		id: id,
		name: req.body.name
	};

    _checkForDupes(categories, modifiedCategory);

	newCategoryPath = path.join(config.database, modifiedCategory.name + config.extension);

	categories.splice(categoryIndex, 1, modifiedCategory);
	jf.writeFileSync(config.categories, categories);

	fs.renameSync(oldCategoryPath, newCategoryPath);

	res.json(modifiedCategory);
});

router.delete('/:id', function(req, res) {
	var config = req.app.get('styleguideConfig'),
		categories = JSON.parse(fs.readFileSync(config.categories, 'utf8')),
		uniqueIds = _.map(categories, 'id'),
		id = Number(req.params.id)
		categoryIndex = uniqueIds.indexOf(id),
		category = categories[categoryIndex];

	if (categoryIndex === -1) {
		res.json(false);
		return;
	}

    var categoryToDeletePath = path.join(config.database, category.name + config.extension);

    fs.unlinkSync(categoryToDeletePath);

	categories.splice(categoryIndex, 1);

	jf.writeFileSync(config.categories, categories);
	res.json(category);
});

function _checkForDupes(categories, category) {
    var nameLower = _.toLower(category.name);

    var containsDupe = _.some(categories, function (cat) { return _.toLower(cat.name) === nameLower});

    if (containsDupe) {
        throw new Error('Category with same name already exists!');
    }
};

module.exports = router;
