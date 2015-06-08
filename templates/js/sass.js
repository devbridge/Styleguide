var sassService = (function ($) {
  var module = {},
      cachedSassData;

  var getSassData = function ( callback ) {
    if ( !cachedSassData ) {
      $.getJSON('./db/sassdata.txt', function ( data ) {
        cachedSassData = data;
        callback(cachedSassData);
      });
    } else {
      callback(cachedSassData);
    }
  };

  var parseColors = function ( colors ) {
    var colorsContainer = $('.js-snippet-colors').first(),
        colorBoxTpl = $('.js-color-box').first(),
        currentColorBox,
        color,
        len,
        index,
        varName;

    colorBoxTpl.find('p').remove();

    colorsContainer.empty();

    for (color in colors) {
      currentColorBox = colorBoxTpl.clone(true);
      currentColorBox.find('i').css('background', color)
                               .text(color);
      for (index = 0, len = colors[color].length; index < len; index++) {
        varName = $('<p>' + colors[color][index] + '</p>');
        currentColorBox.append(varName);
      }
      colorsContainer.append(currentColorBox);
    }
  };

  var parseFonts = function ( typography ) {
    var fontsContainer = $('.js-fonts-container'),
        fontTpl = $('.js-font-tpl'),
        examplesContainer = $('.js-examples-container'),
        exampleTpl = $('.js-font-example'),
        currentFontView,
        currentExampleView,
        currentFont,
        index,
        len = typography.length,
        weightsInd,
        weightsLen,
        fontDescription;

    fontsContainer.empty();
    examplesContainer.empty();

    for (index = 0; index < len; index++) {
      currentFont = typography[index];

      if ( currentFont.weights ) {
        weightsLen = currentFont.weights.length;

        for(weightsInd = 0; weightsInd < weightsLen; weightsInd++) {
          currentFontView = fontTpl.clone(true);
          currentExampleView = exampleTpl.clone(true);

          currentFontView.find('.js-set-font').css({
            'font-family': currentFont.value,
            'font-weight': currentFont.weights[weightsInd]
          });

          currentExampleView.css({
            'font-family': currentFont.value,
            'font-weight': currentFont.weights[weightsInd]
          });

          fontDescription = currentFont.variable + ': ' + currentFont.value + '; '
            + 'font-weight: ' + currentFont.weights[weightsInd] + ';';

          currentFontView.find('.js-variable').text(fontDescription);
          currentExampleView.prepend($('<p>' + fontDescription + '</p>'));

          fontsContainer.append(currentFontView);
          examplesContainer.append(currentExampleView);
        }
      } else {
        fontsContainer.append('Weights were not defined for ' + currentFont.variable + '.<br>');
        examplesContainer.append('Weights were not defined for ' + currentFont.variable + '.<br>');
      }

    }
  };

  module.loadSass = function () {
    getSassData(function ( data ) {
      var sassContent = $($('#sass-page').html()),
          errorMessage = 'Sass variables has not been scraped yet or markers were not found in file!';
      
      $('.main').append(sassContent);

      if ( !data.length ) {
        $('.js-color-box').html(errorMessage);
        $('.js-font-tpl').html(errorMessage);
        $('.js-font-example').html(errorMessage);
        return;
      }

      if ( data[0].colors ) {
        parseColors(data[0].colors);
      } else {
        $('.js-color-box').html(errorMessage);
      }

      if ( data[0].typography ) {
        parseFonts(data[0].typography);  
      } else {
        $('.js-font-tpl').html(errorMessage);
        $('.js-font-example').html(errorMessage);
      }
      
    });
  };

  return module;
})(jQuery || {});