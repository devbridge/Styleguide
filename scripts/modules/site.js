"use strict";

/*jslint regexp: true, nomen: true, sloppy: true */
/*global require, define, alert, applicationConfig, location, document, window,  setTimeout, Countable */

define(['jquery', 'interact', 'typing'], function ($, interact) {
    var module = {};

    var selectors = {
        snippetIframe: $('#js-snippet-code')
    };

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
    module.showLogoOnScroll = function () {
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

        $(window).on('resize', function () {
            if ($(window).width() <= 1024 && header.hasClass('fixed')) {
                header.removeClass('fixed');
            }
        })
    };

    // Resize snippet
    module.initSnippetResize = function () {
        var $handleLeft = $('.js-snippet-resize-handle-left'),
            $handleRight = $('.js-snippet-resize-handle-right'),
            $preview = $('.js-snippet-preview'),
            $resizeLength = $('.js-resize-length'),
            $sizeIndicator = $('.js-snippet-size'),
            $snippetHolder = $('.js-snippet-preview-holder'),
            snippetSource = '.js-snippet-source';

        $resizeLength.css('width', ($snippetHolder.innerWidth() / 2));
        $sizeIndicator.text($snippetHolder.innerWidth() + "px");

        interact($resizeLength[0])
            .resizable({
                edges: {
                    left: $handleRight[0],
                    right: $handleLeft[0],
                    bottom: false,
                    top: false
                },
                onmove: function (e) {
                    var width = e.rect.width,
                        snippetWidth = $snippetHolder.width();

                    $(window).on('resize', function() {
                        snippetWidth = $snippetHolder.width();
                    });

                    if (width < 160) {
                        width = 160;
                    } else if (width > (snippetWidth / 2)) {
                        width = (snippetWidth / 2);
                    }

                    $preview
                        .find(snippetSource)
                        .addClass('resize-overlay');
                    $preview[0].style.width = (width * 2) + 'px';
                    $resizeLength[0].style.width = width + 'px';
                    $sizeIndicator.text((width * 2) + "px");
                    selectors.snippetIframe.height(selectors.snippetIframe.contents().height());
                },
                onend: function () {
                    $preview
                        .find(snippetSource)
                        .removeClass('resize-overlay');
                }
            });
    };

    module.insertSnippetStyles = function () {
        var iframe = $('#js-snippet-code'),
            stylesUrl = '<link href="content/styles/snippet-styles.css" rel="stylesheet" type="text/css"/>';

        iframe.contents().find('head').append(stylesUrl);
    };

    module.initEditor = function () {
        require(['ace/ace'], function (ace) {
            var htmlEditor = ace.edit('js-html-editor'),
                cssEditor = ace.edit('js-css-editor'),
                htmlCode = htmlEditor.getSession().getValue(),
                cssCode = cssEditor.getSession().getValue(),
                editTrigger = $('.js-update-markup'),
                cloneHeadContent = $('#js-snippet-code').contents().find('head').clone().html(),
                codePreview = $('.js-code-preview');

            htmlEditor.setTheme('ace/theme/github');
            htmlEditor.getSession().setMode('ace/mode/html');

            cssEditor.setTheme('ace/theme/github');
            cssEditor.getSession().setMode('ace/mode/css');

            htmlEditor.getSession().on('change', function () {
                htmlCode = htmlEditor.getSession().getValue();
            });

            cssEditor.getSession().on('change', function () {
                cssCode = cssEditor.getSession().getValue();
            });

            selectors.snippetIframe.contents().find('body').html(htmlCode);
            codePreview.text(htmlCode);

            editTrigger.on('click', function () {
                codePreview.text(htmlCode);
                selectors.snippetIframe.contents().find('body').html(htmlCode);
                selectors.snippetIframe.contents().find('head').html(cloneHeadContent + '<style>' + cssCode + '</style>');
            });
        });
    };

    function initToggle(self, container) {
        $('.js-snippet-content').removeClass('active');

        if(self.hasClass('active')) {
            self.removeClass('active');
            container.removeClass('active');
        } else {
            self.addClass('active');
            container.addClass('active');
        }
    }

    module.toggleEdit = function() {
        var editTrigger = $('.js-edit-snippet'),
            snippetContent = $('.js-snippet-content'),
            closeTrigger = $('.js-close-edit'),
            triggerCodePreview = $('.js-trigger-code-preview'),
            self;

        editTrigger.on('click', function() {
            self = $(this);

            if (triggerCodePreview.hasClass('active')) {
                triggerCodePreview.removeClass('active');
            }

            initToggle(self, snippetContent.eq(1));
        });

        triggerCodePreview.on('click', function() {
            self = $(this);

            if (editTrigger.hasClass('active')) {
                editTrigger.removeClass('active');
            }

            initToggle(self, snippetContent.eq(0));
        });

        closeTrigger.on('click', function() {
            editTrigger.removeClass('active');
            snippetContent.eq(1).removeClass('active');
        });
    };

    module.init = function () {
        module.insertSnippetStyles();
        module.initEditor();
        module.initInstallationAnimation();
        module.initStickyHeader();
        module.initToggle();
        module.initScrollTo();
        module.showLogoOnScroll();
        module.initSnippetResize();
        module.toggleEdit();
    };

    return module;
});
