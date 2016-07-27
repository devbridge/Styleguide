var helpers = require('./helpers.js'),
  fs = require('fs'),
  jf = require('jsonfile'),
  path = require('path'),
  exports = module.exports = {};

var pruneArrayAndObject = function () {
  delete Array.prototype.equals;
  delete Object.prototype.equals;
};

var extendArrayAndObject = function() {
  Array.prototype.equals = function(array) {
    if (!array)
      return false;

    if (this.length !== array.length)
      return false;

    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] instanceof Array && array[i] instanceof Array) {
        if (!this[i].equals(array[i]))
          return false;
      } else if (this[i] instanceof Object && array[i] instanceof Object) {
        if (!this[i].equals(array[i]))
          return false;
      } else if (this[i] !== array[i]) {
        return false;
      }
    }
    return true;
  };

  Object.prototype.equals = function(object2) {
    var propName;
    for (propName in this) {
      if (this.hasOwnProperty(propName) !== object2.hasOwnProperty(propName)) {
        return false;
      } else if (typeof this[propName] !== typeof object2[propName]) {
        return false;
      }
    }

    for (propName in object2) {
      if (this.hasOwnProperty(propName) !== object2.hasOwnProperty(propName)) {
        return false;
      } else if (typeof this[propName] !== typeof object2[propName]) {
        return false;
      }

      if (!this.hasOwnProperty(propName))
        continue;

      if (this[propName] instanceof Array && object2[propName] instanceof Array) {
        if (!this[propName].equals(object2[propName]))
          return false;
      } else if (this[propName] instanceof Object && object2[propName] instanceof Object) {
        if (!this[propName].equals(object2[propName]))
          return false;
      } else if (this[propName] !== object2[propName]) {
        return false;
      }
    }
    return true;
  };
};

var parseTypoghraphy = function(theme, variables, cssType) {
  var weights,
    typography,
    type,
    rawTypoArray,
    fontValue,
    variableName,
    index,
    length;

  //replace less variable declaration symbol @ to scss symbol $
  variables = variables.replace(/\n@/gi, '\n$');
  //matches everything between //-- typo:start --// and //-- typo:end --/ including these markers
  typography = variables.match(/\/\/-- typo:start[\d\D]*?typo:end --\/\//gi);
  rawTypoArray = typography[0].split('\n');

  //removing markers
  rawTypoArray.shift();
  rawTypoArray.pop();

  rawTypoArray = rawTypoArray.filter(helpers.filterOutNotVars);

  //Constructing types array
  typography = [];

  //prepare array structure https://regex101.com/
  for (index = 0, length = rawTypoArray.length; index < length; index++) {
    if (cssType === 'scss' || cssType === 'less') {
      //matches from $ to :, including $. To take variable name.
      variableName = rawTypoArray[index].match(/\$[\d\D]*?(?=:)/gi)[0];
      //matches from : to ;, including :. To take variable value.
      fontValue = rawTypoArray[index].match(/(?=:)[\d\D]*?(?=;)/)[0];
    }

    if (cssType === 'styl') {
      //matches from $ to =, including $. To take variable name.
      variableName = rawTypoArray[index].match(/\$[\d\D]*?(?==)/gi)[0];
      //matches from = to /, including =. To take variable value.
      fontValue = rawTypoArray[index].match(/(?==)[\d\D]*?(?=\/)/)[0];
    }

    if (cssType === 'sass') {
      //matches from $ to :, including $. To take variable name.
      variableName = rawTypoArray[index].match(/\$[\d\D]*?(?=:)/gi)[0];
      //matches from : to end of line, including :. To take variable value.
      fontValue = rawTypoArray[index].match(/(?=:)[\d\D]*?(?=\/)/)[0];
    }

    //matches everything in between (), including (. To take font weights.
    weights = rawTypoArray[index].match(/(?=\/)[\d\D]+/gi);

    fontValue = fontValue.substring(1, fontValue.length).trim();

    if (weights) {
      weights = weights[0];
      weights = weights.replace(/\//g, '').replace(/ /g, '').split(',');
      weights = weights.map(helpers.convertToWeightObject);
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

var parseColors = function(theme, variables, cssType, maxSassIterations) {
  var rawColArray,
    unassignedColors = [],
    assignedColors = {},
    iterations = 0,
    index,
    length,
    variableName,
    hexOrVarValue,
    color;

  //replace less variable declaration symbol @ to scss symbol $
  variables = variables.replace(/\n@/gi, '\n$');
  //matches everything between //-- colors:start --// and //-- colors:end --/ including these markers
  rawColArray = variables.match(/\/\/-- colors:start[\d\D]*?colors:end --\/\//gi);

  for (index = 0, length = rawColArray.length; index < length; index++) {
    rawColArray[index] = rawColArray[index].split('\n');

    //remove dom markers
    rawColArray[index].shift();
    rawColArray[index].pop();

    unassignedColors = unassignedColors.concat(rawColArray[index]);
  }

  unassignedColors = unassignedColors.filter(helpers.filterOutNotVars);

  //prepare array structure https://regex101.com/
  for (index = 0, length = unassignedColors.length; index < length; index++) {
    if(cssType === 'less' || cssType === 'scss') {
      //matches from $ to :, including $. To take variable name.
      variableName = unassignedColors[index].match(/\$[\d\D]*?(?=:)/gi)[0];
      //matches from : to ;, including :. To take variable value.
      hexOrVarValue = unassignedColors[index].match(/:[\d\D]*?(?=;)/gi)[0];
    }

    if (cssType === 'styl') {
      //matches from $ to =, including $. To take variable name.
      variableName = unassignedColors[index].match(/\$[\d\D]*?(?==)/gi)[0];
      //matches from = to end of line, including :. To take variable value.
      hexOrVarValue = unassignedColors[index].match(/=[\d\D]+/gi)[0];
    }

    if (cssType === 'sass') {
      //matches from $ to :, including $. To take variable name.
      variableName = unassignedColors[index].match(/\$[\d\D]*?(?=:)/gi)[0];
      //matches from : to end of line, including :. To take variable value.
      hexOrVarValue = unassignedColors[index].match(/:[\d\D]+/gi)[0];
    }

    hexOrVarValue = hexOrVarValue.substring(1, hexOrVarValue.length).trim();

    unassignedColors[index] = {
      variable: variableName,
      value: hexOrVarValue
    };
  }

  while (iterations < maxSassIterations && unassignedColors.length) {
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

  if (iterations === maxSassIterations) {
    console.log('Iterations reached max size, your variables json file could be inaccurate!\nThis means, that variable r-value is trying to show to non existing variable!');
  }

  theme.colors = assignedColors;
};

var compareForReport = function(theme, report, config) {
  var oldData = jf.readFileSync(config.sassData, {throws: false}) || [],
    len = oldData.length,
    index;

  for (index = 0; index < len; index++) {
    if (oldData[index].name === theme.name) {
      oldData = oldData[index];
      break;
    }
  }

  if (!oldData.hasOwnProperty('colors')) {
    oldData = {
      colors: {},
      typography: []
    };
  }

  report.themeName = theme.name;
  report.uniqueColVals = theme.colors ? Object.keys(theme.colors).length : 0;
  report.diffOfColVals = report.uniqueColVals - Object.keys(oldData.colors).length;

  if (theme.typography && !theme.typography.equals(oldData.typography)) {
    report.oldTypo = oldData.typography;
    report.newTypo = theme.typography;
  }
};

exports.scrapeTheme = function(themeIndex, result, sassPaths, maxSassIterations, config) {
  var variables,
    theme = {},
    report = {},
    fileType = path.extname(sassPaths[0]),
    cssType = fileType.substr(1, fileType.length - 1);

    variables = fs.readFileSync(sassPaths[themeIndex], {
    encoding: 'utf-8'
  });
  theme.name = sassPaths[themeIndex];

  //matches everything between //-- typo:start --// and //-- typo:end --/ including these markers
  if (variables.search(/\/\/-- typo:start[\d\D]*?typo:end --\/\//gi) !== -1) {
    parseTypoghraphy(theme, variables, cssType);
  } else {
    console.log('Typography markers not found in ' + theme.name + '.');
  }

  //matches everything between //-- colors:start --// and //-- colors:end --/ including these markers
  if (variables.search(/\/\/-- colors:start[\d\D]*?colors:end --\/\//gi) !== -1) {
    parseColors(theme, variables, cssType, maxSassIterations);
  } else {
    console.log('Color markers not found in ' + theme.name + '.');
  }

  extendArrayAndObject();

  compareForReport(theme, report, config);

  pruneArrayAndObject();

  result.push(theme);

  return report;
};
