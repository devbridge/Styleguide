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

        triggerInstall.loadTyping({
            incorrectTypingSpeed: 50
        });

        triggerStart.loadTyping({
            incorrectTypingSpeed: 50
        });

        function installationAnimation() {
            installationList.addClass('animate');
        }

        if ($(window).scrollTop() > containerPosition) {
            installationAnimation();
        }

        $(window).on('scroll', function () {
            if ($(window).scrollTop() > containerPosition) {
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

    // Reveals the header logo, then main logo in first slide is scrolled over
    module.showLogoOnScroll = function(){
        var logo = $('.js-logo-header'),
            siteHeader = $('.js-logo-reveal'),
            headerHeight,
            logoTop,
            windowVar = $(window),
            windowScrollTop;

        function toggleVisibility() {
            windowScrollTop = windowVar.scrollTop();

            if (windowScrollTop > logoTop - headerHeight) {
                siteHeader.addClass('home-logo-is-invisible');
            } else {
                siteHeader.removeClass('home-logo-is-invisible');
            }
        }

        if (logo.length) {
            headerHeight = $('.page-header').outerHeight();
            logoTop = logo.offset().top + logo.height();

            toggleVisibility();

            windowVar.on('scroll', function () {
                toggleVisibility();
            });

            windowVar.on('resize', function () {
                logoTop = logo.offset().top + logo.outerHeight() - headerHeight;
                toggleVisibility();
            });
        }
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
        module.showLogoOnScroll();
    };

    return module;
});