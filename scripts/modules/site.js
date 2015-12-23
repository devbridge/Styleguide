"use strict";

/*jslint regexp: true, nomen: true, sloppy: true */
/*global require, define, alert, applicationConfig, location, document, window,  setTimeout, Countable */

define(['jquery', 'slickSlider', 'modal'], function ($) {
    var module = {};

    module.sample = function () {
        // Description: Dummy module, remove this after javascript setup is finished
        console.log('sample');
    };

    module.init = function () {
        module.sample();
    };

    return module;
});