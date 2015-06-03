var sassService = (function ($) {
  var module = {},
      cachedSassData;

  var getSassData = function ( callback ) {
    if ( !cachedSassData ) {
      $.getJSON('../../../styleguide_db/sassdata.txt', function ( data ) {
        cachedSassData = data;
        callback(cachedSassData);
      });
    } else {
      callback(cachedSassData);
    }
  };

  var parseColors = function ( colors ) {
    var colorsContainer = $('.js-snippet-colors'),
        colorBoxTpl = $('.js-color-box'),
        currentColorBox,
        color,
        len,
        index,
        varName;

    colorsContainer.empty();

    for (color in colors) {
      currentColorBox = colorBoxTpl.clone(true);
      currentColorBox.find('i').css('background', color);
      for (index = 0, len = colors[color].length; index < len; index++) {
        varName = $('<p>' + colors[color][index] + '</p>');
        currentColorBox.append(varName);
      }
      colorsContainer.append(currentColorBox);
    }
  };

  module.loadSass = function () {
    getSassData(function ( data ) {
      parseColors(data[0].colors);
    });
  };

  return module;
})(jQuery || {});