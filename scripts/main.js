/*jslint regexp: true, nomen: true, sloppy: true */
/*global require, applicationConfig, window, applicationConfig */
require.config({
    baseUrl: '/scripts/',
    paths: {
        jquery: [
            '//cdn.jsdelivr.net/jquery/1.11.3/jquery.min',
            'libs/jquery-1.11.3.min'
        ],
        validation: [
            '//cdn.jsdelivr.net/jquery.validation/1.14.0/jquery.validate.min',
            'plugins/jquery.validate.min'
        ],
        slickSlider: [
            '//cdn.jsdelivr.net/jquery.slick/1.5.8/slick.min',
            'plugins/slick.min'
        ],
        modal: 'plugins/jquery.modal',
        site: 'modules/site'
    },
    shim: {
        validation: {
            deps: ['jquery']
        }
    }
});
require(['jquery', 'site'], function ($, site) {
    var console = window.console || { log: $.noop, error: $.noop },
        maxData = [];
    if (typeof applicationConfig != 'undefined') {
        var config = applicationConfig;
    }
    if (typeof site != 'undefined') {
        site.init();
    }
});
