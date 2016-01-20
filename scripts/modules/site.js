"use strict";

/*jslint regexp: true, nomen: true, sloppy: true */
/*global require, define, alert, applicationConfig, location, document, window,  setTimeout, Countable */

define(['jquery', 'typing'], function ($) {
    var module = {};

    module.initInstallationAnimation = function () {
        var triggerInstall = $('.js-typing-install'),
            triggerStart = $('.js-typing-start'),
            triggerIntroCommand = $('.js-intro-command'),
            installationList = $('li', '.installation-process'),
            installationContainer = $('#installation'),
            containerPosition = (installationContainer.offset().top * 1.15) - $(window).height();

        // Animate text of 'npm install devbridge-styleguide --save-dev' command in intro section
        triggerIntroCommand.addClass('animate');
        triggerIntroCommand.loadTyping({
            incorrectTypingSpeed: 70,
            deletingSpeed: 70,
            correctTypingSpeed: 70
        });

        function installationAnimation() {
            installationList.addClass('animate');

            if (installationList.hasClass('animate')) {
                // Animate text of 'npm install devbridge-styleguide --save-dev' command in Installation section
                triggerInstall.loadTyping({
                    incorrectTypingSpeed: 50
                });

                setTimeout(function () {
                    // Animate text of 'gulp start-styleguide' command in Installation section
                    triggerStart.loadTyping({
                        incorrectTypingSpeed: 50
                    });
                }, 2500);
            }
        }

        if ($(window).scrollTop() > containerPosition) {
            installationAnimation();
        }

        $(window).on('scroll', function () {
            if ($(window).scrollTop() > containerPosition) {
                $(window).off('scroll');
                installationAnimation();
            }
        });
    };

    // Expand/Collapse function
    module.initToggle = function () {
        var trigger = $('.js-toggle-button'),
            container = $('.js-toggle-container'),
            activeClass = 'opened',
            self;

        trigger.on('click', function () {
            self = $(this);

            if (!container.hasClass(activeClass)) {
                self.removeClass('active');
                container.addClass(activeClass);
            } else {
                self.addClass('active');
                container.removeClass(activeClass);
            }
        })
    };

    // Scrolls to specific section when clicked navigation's link
    module.initScrollTo = function () {
        var triggerContainer = ('.js-scroll-nav'),
            spaceTop,
            targetElement,
            self;

        $('a', triggerContainer).on('click', function (event) {
            event.preventDefault();

            self = $(this);
            targetElement = $(self.attr('href'));

            if ($(window).width() > 1024) {
                spaceTop = 85;
            } else {
                spaceTop = 0;
            }

            $('html, body').animate({
                scrollTop: targetElement.offset().top - spaceTop
            }, 800);
        });
    };

    // Updates header position to fixed
    module.initStickyHeader = function () {
        var header = $('.js-header');

        function stickyHeader() {
            if ($(document).scrollTop() > 0) {
                header.addClass('fixed');
            } else {
                header.removeClass('fixed');
            }
        }

        if ($(window).width() > 1024) {
            stickyHeader();
        }

        $(window).on('scroll', function () {
            if ($(window).width() > 1024) {
                stickyHeader();
            }
        });

        $(window).on('resize', function() {
            if($(window).width() <= 1024 && header.hasClass('fixed')) {
                header.removeClass('fixed');
            }
        })
    };

    module.init = function () {
        module.initInstallationAnimation();
        module.initStickyHeader();
        module.initToggle();
        module.initScrollTo();
    };

    return module;
});