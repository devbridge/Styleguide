function enableDemoEdit() {
    $('html').addClass('server-on');
    $('head').append('<link rel="stylesheet" href="demo-styles/demo-styles.css" type="text/css" />');

    $('.demo-warning').remove();
    var codeWarningMessage = $("<div class='demo-warning'>This is a demo page, save functionality is disabled.</div>");

    $('.js-snippet-edit-src, .js-snippet-tab-src').append(codeWarningMessage);

    $('.btn-delete').attr('disabled', 'disabled');
    $('.sg-controls-buttons').find('.btn-primary').attr('disabled', 'disabled');

    $('.js-header-new-snippet').on('click', function () {
        $('.js-new-snippet-form').toggleClass('active');
    });

    $('.js-new-snippet-cancel').on('click', function () {
        $('.js-new-snippet-form').removeClass('active');
    });

    $('.js-snippet-tab-action').on('click', function () {
        var self = $(this),
            form = self.closest('.sg-form-wrapper'),
            editTab = '#' + self.attr('data-target');

        form.find('.is-active').removeClass('is-active');
        self.parent().addClass('is-active');
        form.find(editTab).addClass('is-active');

    });
}

var Helper = {};

Helper.debounce = function(func, wait, immediate) {
    var timeout;

    return function() {

        var context = this,   /* 1 */
            args = arguments; /* 2 */

        var later = function() {

            timeout = null;

            if ( !immediate ) {
                func.apply(context, args);
            }
        };

        var callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait || 200);

        if ( callNow ) {
            func.apply(context, args);
        }
    };
};

(function(){
    var oldLog = console.log;
    console.log = function (message) {
        oldLog.apply(console, arguments);

        if (message === 'VIEW ONLY MODE - Server is not running') {
            enableDemoEdit();
        }
    };

    $('.js-navigation-list').on('click', function() {
        $('.main').on('DOMSubtreeModified', Helper.debounce(enableDemoEdit, 600, false));
    });

})();