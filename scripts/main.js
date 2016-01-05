/*jslint regexp: true, nomen: true, sloppy: true */
/*global require, applicationConfig, window, applicationConfig */
require.config({
    baseUrl: 'scripts/',
    paths: {
        jquery: [
            '//cdn.jsdelivr.net/jquery/1.11.3/jquery.min',
            'libs/jquery-1.11.3.min'
        ],
        typing: 'plugins/typing-plugin',
        prism: 'plugins/prism',
        site: 'modules/site'
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
