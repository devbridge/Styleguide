var jf = require('jsonfile'),
  helpers = require('./helpers.js'),
  fs = require('fs'),
  config = JSON.parse(fs.readFileSync('./styleguide_config.txt', 'utf8')),

  exports = module.exports = {};

var parseTypoghraphy = function(theme, sass) {
  var weights,
    typography,
    type,
    rawTypoArray,
    fontValue,
    variableName,
    index,
    length;

  //matches everything between //-- typo:start --// and //-- typo:end --/ including these markers
  typography = sass.match(/\/\/-- typo:start[\d\D]*?typo:end --\/\//gi);
  rawTypoArray = typography[0].split('\n');

  //removing markers
  rawTypoArray.shift();
  rawTypoArray.pop();

  rawTypoArray = rawTypoArray.filter(helpers.filterOutNotVars);

  //Constructing types array
  typography = [];

  for (index = 0, length = rawTypoArray.length; index < length; index++) {
    //matches from $ to :, including $. To take variable name.
    variableName = rawTypoArray[index].match(/\$[\d\D]*?(?=:)/gi)[0];
    //matches from : to ;, including :. To take variable value.
    fontValue = rawTypoArray[index].match(/(?=:)[\d\D]*?(?=;)/)[0];
    //matches everything in between (), including (. To take font weights.
    weights = rawTypoArray[index].match(/\([\d\D]*?(?=\))/gi);

    fontValue = fontValue.substring(1, fontValue.length).trim();

    if (weights) {
      weights = weights[0];
      weights = weights.substring(1, weights.length);
      weights = weights.replace(/ /g, '').split(',');
      weights = weights.map(helpers.convertToNumber);
      weights = weights.sort();
    } else {
      console.log('Weights were not found for ' + variableName + '.');
    }

    type = {
      variable: variableName,
      value: fontValue,
      weights: weights
    };

    typography.push(type);
  }

  theme.typography = typography;
};

var parseColors = function(theme, sass) {
  //matches everything between //-- colors:start --// and //-- colors:end --/ including these markers
  var rawColArray = sass.match(/\/\/-- colors:start[\d\D]*?colors:end --\/\//gi),
    unassignedColors = [],
    assignedColors = {},
    iterations = 0,
    index,
    length,
    variableName,
    hexOrVarValue,
    color;

  for (index = 0, length = rawColArray.length; index < length; index++) {
    rawColArray[index] = rawColArray[index].split('\n');

    //remove dom markers
    rawColArray[index].shift();
    rawColArray[index].pop();

    unassignedColors = unassignedColors.concat(rawColArray[index]);
  }

  unassignedColors = unassignedColors.filter(helpers.filterOutNotVars);

  //prepare array structure
  for (index = 0, length = unassignedColors.length; index < length; index++) {
    //matches from $ to :, including $. To take variable name.
    variableName = unassignedColors[index].match(/\$[\d\D]*?(?=:)/gi)[0];
    //matches from : to ;, including :. To take variable value.
    hexOrVarValue = unassignedColors[index].match(/\:[\d\D]*?(?=;)/gi)[0];

    hexOrVarValue = hexOrVarValue.substring(1, hexOrVarValue.length).trim();

    unassignedColors[index] = {
      variable: variableName,
      value: hexOrVarValue
    };
  }

  while (iterations < config.maxSassIterations && unassignedColors.length) {
    for (index = 0; index < unassignedColors.length; index++) {
      if (unassignedColors[index].value.indexOf('$') !== 0) {
        if (assignedColors[unassignedColors[index].value]) {
          assignedColors[unassignedColors[index].value].push(unassignedColors[index].variable);
        } else {
          assignedColors[unassignedColors[index].value] = [unassignedColors[index].variable];
        }

        unassignedColors.splice(index, 1);
      } else {
        for (color in assignedColors) {
          if (assignedColors[color].indexOf(unassignedColors[index].value) !== -1) {
            assignedColors[color].push(unassignedColors[index].variable);
            unassignedColors.splice(index, 1);
            break;
          }
        }
      }
    }
    iterations++;
  }

  if (iterations === config.maxSassIterations) {
    console.log('Iterations reached max size, your variables json file could be inaccurate!\nThis means, that variable r-value is trying to show to non existing variable!');
  }

  theme.colors = assignedColors;
};

exports.scrapeTheme = function(themeIndex, result) {
  var sass,
    theme = {};

  sass = fs.readFileSync(config.sassResources[themeIndex], {
    encoding: 'utf-8'
  });
  theme.name = config.sassResources[themeIndex];

  //matches everything between //-- typo:start --// and //-- typo:end --/ including these markers
  if (sass.search(/\/\/-- typo:start[\d\D]*?typo:end --\/\//gi) !== -1) {
    parseTypoghraphy(theme, sass);
  } else {
    console.log('Typography markers not found in ' + theme.name + '.');
  }

  //matches everything between //-- colors:start --// and //-- colors:end --/ including these markers
  if (sass.search(/\/\/-- colors:start[\d\D]*?colors:end --\/\//gi) !== -1) {
    parseColors(theme, sass);
  } else {
    console.log('Color markers not found in ' + theme.name + '.');
  }

  result.push(theme);
};