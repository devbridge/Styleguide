var sassService = (function ($) {
    var module = {},
        cachedSassData;

    var getSassData = function (callback) {
        if (!cachedSassData) {
            $.getJSON('./db/sassdata.txt', function (data) {
                cachedSassData = data;
                callback(cachedSassData);
            });
        } else {
            callback(cachedSassData);
        }
    };

    var parseHsv = function (rgb) {
        var hsv,
            hue = 0,
            sat,
            val,
            chr,
            max,
            min;

        rgb = rgb.replace(/[rgb()]/g, '').split(',').map(Number);

        rgb[0] = rgb[0] / 255;
        rgb[1] = rgb[1] / 255;
        rgb[2] = rgb[2] / 255;

        max = Math.max.apply(Math, rgb);
        min = Math.min.apply(Math, rgb);

        val = max;
        chr = max - min;

        sat = max === 0 ? 0 : chr / max;

        if (max === min) {
            hue = 0;
        } else {
            switch (max) {
                case rgb[0]:
                    hue = (rgb[1] - rgb[2]) / chr + (rgb[1] < rgb[2] ? 6 : 0);
                    break;
                case rgb[1]:
                    hue = (rgb[2] - rgb[0]) / chr + 2;
                    break;
                case rgb[2]:
                    hue = (rgb[0] - rgb[1]) / chr + 4;
                    break;
            }
            hue /= 6;
        }

        hsv = {
            hue: hue,
            sat: sat,
            val: val
        };

        return hsv;
    };

    var colorComparator = function (a, b) {
        var aColor = a.find('span').css('background-color'),
            bColor = b.find('span').css('background-color');

        aColor = parseHsv(aColor);
        bColor = parseHsv(bColor);

        if (aColor.hue < bColor.hue)
            return 1;
        if (aColor.hue > bColor.hue)
            return -1;
        if (aColor.sat < bColor.sat)
            return 1;
        if (aColor.sat > bColor.sat)
            return -1;
        if (aColor.val < bColor.val)
            return 1;
        if (aColor.val > bColor.val)
            return -1;
        return 0;
    };

    var parseColors = function (colors) {
        var colorsContainer = $('.js-snippet-colors').first(),
            colorBoxTpl = $('.js-color-box').first(),
            currentColorBox,
            colorBoxes = [],
            color,
            len,
            index;
        //varName;

        //colorBoxTpl.find('p').remove();

        colorsContainer.empty();

        for (color in colors) {
            if (colors.hasOwnProperty(color)) {
                currentColorBox = colorBoxTpl.clone(true);
                currentColorBox
                .find('span')
                .css('background', color)
                .attr('data-color-text', color);

                //for (index = 0, len = colors[color].length; index < len; index++) {
                //    varName = $('<p>' + colors[color][index] + '</p>');
                //    currentColorBox.append(varName);
                //}

                colorBoxes.push(currentColorBox);
            }
        }

        colorBoxes.sort(colorComparator);

        for (index = 0, len = colorBoxes.length; index < len; index++) {
            colorsContainer.append(colorBoxes[index]);
        }
    };

    var parseFonts = function (typography) {
        var fontsContainer = $('.js-fonts-container'),
            fontTpl = $('.js-font-tpl'),
            currentFontView,
            currentFont,
            index,
            len = typography.length,
            weightsInd,
            weightsLen,
            fontDescription;

        fontsContainer.empty();

        for (index = 0; index < len; index++) {
            currentFont = typography[index];

            fontDescription = currentFont.variable + ': ' + currentFont.value + ';';

            if (currentFont.weights) {
                weightsLen = currentFont.weights.length;

                for (weightsInd = 0; weightsInd < weightsLen; weightsInd++) {
                    currentFontView = fontTpl.clone(true);

                    currentFontView
                    .find('.js-set-font')
                    .css({
                        'font-family': currentFont.value,
                        'font-weight': currentFont.weights[weightsInd].weight,
                        'font-style': currentFont.weights[weightsInd].italic ? 'italic' : 'normal'
                    });

                    fontDescription = currentFont.variable + ': ' + currentFont.value + '; ' + 'font-weight: ' + currentFont.weights[weightsInd].weight + ';';

                    if (currentFont.weights[weightsInd].italic) {
                        fontDescription += ' font-style: italic;';
                    }

                    currentFontView
                    .find('.js-variable')
                    .text(fontDescription);

                    fontsContainer.append(currentFontView);
                }

                if (index < len - 1) {
                    fontsContainer.append('<li><hr></li>');
                }
            } else {
                fontsContainer.append('Weights were not defined for ' + currentFont.variable + '.<br>');
            }
        }
    };

    module.loadSass = function () {
        getSassData(function (data) {
            var sassContent = $($('#sass-page').html()),
                scrapeMessage = $($('#scrape-message').html()),
                snippetsContents,
                snippets = [];

            if (!data.length || $.isEmptyObject(data[0].typography) && $.isEmptyObject(data[0].colors)) {
                $('.main').append(scrapeMessage);
                return;
            }

            $('.main').append(sassContent);

            if (!$.isEmptyObject(data[0].colors)) {
                parseColors(data[0].colors);
            }else {
                $('.js-colors').hide();
            }

            if (!$.isEmptyObject(data[0].typography)) {
                parseFonts(data[0].typography);
            }else {
                $('.js-fonts').hide();
            }

            snippetsContents = $(".js-styles-preview");

            snippetsContents.each(function (index, value) {
                snippets.push({
                    id: 'static-' + index,
                    content: $(value).html()
                });
            });

            iframesService.formFramesForStatic(snippets, function (frames, snippets) {
                snippetActions.drawStaticSnippets(frames, snippets, snippetsContents);
            });
        });
    };

    return module;
})(jQuery || {});