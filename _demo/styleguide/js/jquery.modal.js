/*global jQuery, define*/

// Uses AMD or browser globals to create a jQuery plugin.
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var version = '0.1',
        openCount = 0,
        openModals = [],
        noop = function () { },
        fakeConsole = { log: noop },
        console = window.console || fakeConsole,

        getDefaultOptions = function () {
            return {
                loader: '<div class="modal-loader" role="status">Loading...</div>',
                htmlClass: 'modal-on',
                className: null,
                closeOnBlur: true,
                closeOnEscape: true,
                templateId: null,
                openEffect: 'fadeIn',
                openDuration: 100,
                closeEffect: 'fadeOut',
                closeDuration: 100,
                autofocus: true,
                debug: false,
                keepPosition: true
            };
        },

        getDefaultTemplate = function () {
            return '<div class="modal-context" role="dialog">' + //alertdialog
                '  <div class="modal-container" data-modal-control="container" role="region">' +
                '    <div class="modal-title" data-modal-control="title" role="heading"></div>' +
                '    <button class="modal-close" data-modal-control="close"></button>' +
                '    <div class="modal-content" data-modal-control="content"></div>' +
                '  </div>' +
                '</div>';
        },

        getTemplate = function (options) {
            var template = null,
                tplContainer;

            if (options.templateId) {
                tplContainer = $('#' + options.templateId);
                if (tplContainer.length) {
                    template = tplContainer.html();
                }
            }

            return template || getDefaultTemplate();
        };

    function Modal(options) {
        var that = this;
        that.options = $.extend(getDefaultOptions(), options);
        that.template = getTemplate(that.options);
        that.context = $(that.template);
        that.container = $('[data-modal-control="container"]', that.context);
        that.contentContainer = $('[data-modal-control="content"]', that.context);
        that.titleContainer = $('[data-modal-control="title"]', that.context);
        that.eventHandlers = [];
        that.positionAtOpen = 0;

        if (!options.debug){
            that.console = fakeConsole;
        }

        // Initialize modal popup:
        that.init();
    }

    Modal.version = version;

    Modal.openCount = function () {
        return openCount;
    };

    Modal.openModals = function () {
        return openModals;
    };

    Modal.parseOptions = function (element) {
        /*jslint evil: true*/
        var el = $(element),
            value = el.attr('data-modal'),
            options = (new Function('return ' + value)()) || {};

        // Verify if URL is local link:
        options.url = options.url || el.attr('href');

        // Get title:
        options.title = options.title || el.attr('title') || el.text();

        return options;
    };

    Modal.prototype = {

        version: version,

        init: function () {
            var that = this,
                options = that.options;

            if (options.width) {
                that.container.width(options.width);
            }

            if (options.height) {
                that.contentContainer.height(options.height);
            }

            if (options.className) {
                that.context.addClass(options.className);
            }

            that.context.on('click', '[data-modal-control="close"]', function () {
                that.close();
            });

            that.context.on('click', function (e) {
                // Only close if was clicked on
                if (options.closeOnBlur && e.target === this) {
                    that.close();
                }
            });

            that.on('close', options.onClose || noop);
            that.on('load', options.onLoad || noop);

            that.title(that.options.title);
        },

        option: function (option, value) {
            var options = this.options;
            if (arguments.length === 1) {
                return options[option];
            }
            options[option] = value;
            return this;
        },

        open: function () {
            var that = this,
                options = that.options,
                fx = options.openEffect,
                durration = options.openDuration;

            that.context.appendTo('body');
            if (fx && durration && that.context[fx]) {
                that.context.hide()[fx](durration);
            }
            that.loadContent();
            openCount += 1;
            openModals.push(this);

            if (openCount === 1) {
                that.onFirstOpen();
            }
        },

        close: function (force) {
            var that = this,
                options = that.options,
                fx = options.closeEffect,
                durration = options.closeDuration,
                finalize = function () {
                    that.context.remove();
                    openCount -= 1;
                    openModals.pop();
                    if (openCount === 0) {
                        that.onLastClose();
                    }
                };

            if (force || that.fire('close') !== false) {
                if (fx && durration && that.context[fx]) {
                    that.context[fx](durration).promise().done(finalize);
                } else {
                    finalize();
                }
            }
        },

        loadContent: function () {
            var that = this,
                options = that.options,
                url = options.url,
                content;

            if (options.content) {
                // Return before seting content, otherwise loaded event will not fire
                setTimeout(function () { that.content(options.content); }, 0);
                return;
            }

            if (url && url[0] === '#') {
                content = $(url).html();
                setTimeout(function () { that.content(content); }, 0);
                return;
            }

            if (url) {
                that.showLoader();
                $.ajax({
                    url: url
                }).done(function (data) {
                    that.content(data);
                });
            }
        },

        title: function (value) {
            if (arguments.length === 0) {
                return this.options.title;
            }

            this.options.title = value;
            this.titleContainer.html(value);
        },

        content: function (value) {
            var that = this,
                options = that.options,
                contentContainer = that.contentContainer;

            if (arguments.length === 0) {
                return options.content;
            }

            options.content = value;
            contentContainer.html(value);

            if (options.autofocus) {
                contentContainer.find('input:text:first').focus();
            }

            that.fire('load');
        },

        showLoader: function () {
            this.contentContainer.html(this.options.loader);
        },

        on: function (eventName, callback) {
            this.eventHandlers[eventName] = callback;
            return this;
        },

        fire: function (eventName) {
            console.log('Fire: ' + eventName);
            return (this.eventHandlers[eventName] || noop).call(this);
        },

        onFirstOpen: function () {
            this.positionAtOpen = $(window).scrollTop();
            $('html').addClass(this.options.htmlClass);
        },

        onLastClose: function () {
            $('html').removeClass(this.options.htmlClass);
            if(this.options.keepPosition === true) {
                $(window).scrollTop(this.positionAtOpen);
            }
        }
    };

    $.Modal = Modal;

    $.fn.openModal = function (options) {
        return this.each(function () {
            var parsedOptions = Modal.parseOptions(this),
                modalOptions = $.extend({}, parsedOptions, options || {}),
                modal = new Modal(modalOptions);

            modal.open();
            return false;
        });
    };

    $.openModal = function (options) {
        var modal = new Modal(options);
        modal.open();
        return modal;
    };

    // Close last open window when escape is pressed:
    $(window).on('keyup', function (e) {
        // Exit if not escape:
        if (e.which !== 27) { return; }

        // Find last popup and trigger close:
        var modal = openModals[openModals.length - 1];
        if (modal && modal.options.closeOnEscape) {
            modal.close();
        }
    });
}));