/*jslint regexp: true, nomen: true, sloppy: true */
/*global require, applicationConfig, window, applicationConfig */
require.config({
    baseUrl: 'scripts/',
    paths: {
        jquery: [
            '//cdn.jsdelivr.net/jquery/1.11.3/jquery.min',
            'libs/jquery-1.11.3.min'
        ],
        ace: 'libs/ace/',
        typing: 'plugins/typing-plugin',
        prism: 'plugins/prism',
        interact: 'plugins/interact-1.2.4.min',
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
