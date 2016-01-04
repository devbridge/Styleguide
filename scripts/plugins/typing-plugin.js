(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {

    $.fn.loadTyping = function(set) {
        var settings = $.extend({
            incorrectTypingSpeed: 100,
            deletingSpeed: 50,
            correctTypingSpeed: 130,
            ignoreIncorrect: true
        }, set);

        var $string = $(this), // string to operate
            incorrectTypingSpeed = settings.incorrectTypingSpeed,
            deleteSpeed = settings.deletingSpeed,
            correctTypingSpeed = settings.correctTypingSpeed,
            sumAll = 0;

        // Prints first letters, defined by variable showAtFirst
        function startTyping(spanElement, letterArray, showAtFirst) {

            sumAll = 0; // reset value at first

            var sumArray = (incorrectTypingSpeed * showAtFirst) + 1; // always add 1 to leave possibility to to some changes between timeouts

            for (var i = 0; i <= showAtFirst; i++) {
                doTimeout(i);
            }

            function doTimeout(i) {

                setTimeout(function() {

                    spanElement.text(spanElement.text() + letterArray[i]);

                }, i * incorrectTypingSpeed);

            }

            sumAll += sumArray;
        }

        // At first, adds extra space, then prints incorrect string (defined by array incorrectLetterArray)
        function typeIncorrect(spanElement, incorrectLetterArray, delay) {

            var sumArray = (incorrectTypingSpeed * (incorrectLetterArray.length - 1)) + 1;

            setTimeout(function() {
                spanElement.text(spanElement.text() + ' ');
            }, (delay - 1));

            for (var i = 0; i <= (incorrectLetterArray.length - 1); i++) {
                doTimeout(i);
            }

            function doTimeout(i) {

                setTimeout(function() {
                    spanElement.text(spanElement.text() + incorrectLetterArray[i]);
                }, delay + (i * incorrectTypingSpeed));

            }

            sumAll += sumArray;
        }

        // At first, defines current string length (with bad value), then deletes number letters of bad value.
        // incorrectLetterArray length + 1, because of extra space added previously.
        function deleteIncorrect(spanElement, incorrectLetterArray, delay) {

            var sumArray = (deleteSpeed * incorrectLetterArray.length) + 1;

            var currentLength;

            setTimeout(function() {
                currentLength = spanElement.text().split('').length;
            }, (delay - 1));

            for (var i = 0; i <= incorrectLetterArray.length; i++) {
                doTimeout(i);
            }

            function doTimeout(i) {

                setTimeout(function() {
                    spanElement.text(spanElement.text().substring(0,currentLength));
                    currentLength--;

                }, delay + (i * deleteSpeed));

            }

            sumAll += sumArray;
        }

        // Adds correct letters, that weren't showed at first
        function typeCorrect(spanElement, letterArray, showAtFirst, delay) {

            var ignoreWritten = 0;

            for (var i = (showAtFirst + 1); i <= (letterArray.length - 1); i++) {
                ignoreWritten = i - showAtFirst;
                doTimeout(i, ignoreWritten);
            }

            function doTimeout(i, ignored) {

                setTimeout(function() {
                    spanElement.text(spanElement.text() + letterArray[i]);

                }, delay + (ignored * correctTypingSpeed));

            }

        }

        $string.each(function() {
            var $this = $(this),
                $thisSpan = $this.find('span:first'), // container of string
                letterArray = $thisSpan.text().split(''), // put whole string to array
                textLength = $thisSpan.text().length,
                incorrectValue = $this.data('tpr-incorrect'),
                incorrectLetterArray = [],
                showAtFirst = $this.data('tpr-letters');

            $thisSpan.empty(); // make string empty at first

            if (settings.ignoreIncorrect === true && incorrectValue !== undefined && showAtFirst !== undefined) {
                incorrectLetterArray = incorrectValue.split(''); // incorrect string - put to array
                startTyping($thisSpan, letterArray, showAtFirst);
                typeIncorrect($thisSpan, incorrectLetterArray, sumAll);
                deleteIncorrect($thisSpan, incorrectLetterArray, sumAll);
                typeCorrect($thisSpan, letterArray, showAtFirst, sumAll);
            }
            else {
                startTyping($thisSpan, letterArray, (textLength - 1));
            }
        });

    }

}));
