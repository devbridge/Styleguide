var viewService = (function ($, editorService, sassService, categoryService, snippetService) {
    var module = {},
        views,
        currentView,
        defaultResolution,
        isServerOn;

    var bindNavClick = function (e) {
        e.preventDefault();
        var id = $(this).data('id');
        redrawPage(id);
        window
            .history
            .pushState(
                {
                    id: id
                },
                '',
                '#' + id
            );
    };

    var categoriesComparator = function (a, b) {
        return a.category.name > b.category.name;
    };

    var sortAndAppendLinks = function (navList, navLinksArr) {
        var sass,
            undefCat,
            index,
            len = navLinksArr.length;

        sass = navLinksArr.map(function (el) {
            return el.category.id;
        }).indexOf('sass');
        sass = navLinksArr.splice(sass, 1);

        undefCat = navLinksArr.map(function (el) {
            return el.category.name;
        }).indexOf('undefined');
        undefCat = navLinksArr.splice(undefCat, 1);

        navLinksArr.sort(categoriesComparator);
        navLinksArr.unshift(sass[0]);
        navLinksArr.push(undefCat[0]);

        for (index = 0; index < len; index++) {
            navList.append(navLinksArr[index].element);
            navLinksArr[index]
                .element
                .wrap("<li></li>");
        }
    };

    var buildNavigation = function (navigation, list, refreshContent) {
        var currentPage = navigation.find('.js-current-page'),
            navList = navigation.find(list),
            pages = [{
                name: 'General',
                id: 'sass'
            }],
            route = window.location.hash,
            navLinksArr = [],

            //temp array variables
            iteratingPage,
            pageElement,
            index,
            len;

        route = route.replace('#', '');
        currentPage.text(pages[0].name);

        categoryService.getCategories(function (categories) {
            views = pages = pages.concat(categories);

            len = pages.length;

            navList.on('added:element', function () {
                if (navLinksArr.length === pages.length) {
                    sortAndAppendLinks(navList, navLinksArr);
                }
            });

            for (index = 0; len > index; index++) {
                iteratingPage = pages[index];
                snippetService.getCategoryItemsCount(iteratingPage, function (count, category) {
                    pageElement = $('<button type="button" data-id="' + category.id + '">' + category.name + '</button>');
                    pageElement.on('click', bindNavClick);

                    navLinksArr.push({
                        element: pageElement,
                        category: category
                    });
                    navList.trigger('added:element');
                });
            }

            if (route.length) {
                currentView = $.grep(views, function (el) {
                    return el.id == route;
                }).pop();
            } else {
                currentView = views[0];
                window
                    .history
                    .replaceState(
                        {
                            id: currentView.id
                        },
                        '',
                        ''
                    );
            }

            if(refreshContent === true) {
                redrawPage(currentView.id);
            }
        });
    };

    var redrawPage = function (categoryId) {
        var snippetResizeControls = $('.js-sg-snippets-resize'),
            homeNavigation = $('.js-home-navigation'),
            currentPage = $('.js-current-page');

        $('.main').empty();

        function snippetsPage() {
            currentPage.text(currentView.name);
            snippetResizeControls.show();
            homeNavigation.hide();
        }

        if (typeof categoryId === 'number') {
            currentView = $.grep(views, function (el) {
                return el.id === categoryId;
            }).pop();

            iframesService.formFramesForCategory(categoryId, function (frames, snippets) {
                snippetActions.drawSnippets(frames, snippets, defaultResolution);
            });

            snippetsPage();
        } else if (typeof categoryId === 'string' && categoryId === 'deleted') {
            currentView = views[views.length - 1];

            iframesService.formFramesForDeleted(function (frames, snippets) {
                snippetActions.drawSnippets(frames, snippets, defaultResolution);
            });

            snippetsPage();
        } else {
            currentView = views[0];

            //home page
            snippetResizeControls.hide();
            homeNavigation.show();
            currentPage.text(currentView.name);
            sassService.loadSass();
        }
    };

    var defaultResolutionsHandler = function (width, fromInput) {
        var iFrames = $('iframe'),
            iFramesArray = iFrames.get(),

            updateField = fromInput ? false : true,
            windowWidth = $(window).width(),
            inputWidth = width,

            //array
            len = iFramesArray.length,
            index;

        //in case of invalid input
        if (width < 320 || width === "" || isNaN(width)) {
            width = 320;
        }

        if (width + 100 > windowWidth) {
            width = windowWidth - 100;
        }

        //snippets elements
        for (index = 0; index < len; index++) {
            iFramesArray[index].style.width = width;
        }
        $('.js-snippet-preview').css('width', width);
        $('.js-snippet-size').text(width + 'px');
        $('.js-resize-length').css('width', parseInt(width / 2, 10));

        //input
        if (updateField === true) {
            $('.js-custom-media').val(width);
        }

        //variables
        document.cookie = "styleguideMedia=" + inputWidth + "; path=/";
        defaultResolution = width;

        //update iFrames heights to avoid scrollbars
        snippetActions.handleHeights(iFrames);
    };

    var bindResolutionActions = function () {
        var customInput = $('.js-custom-media'),
            mediaList = $('.js-media-list'),

            mediaCookie = document.cookie.replace(/(?:(?:^|.*;\s*)styleguideMedia\s*\=\s*([^;]*).*$)|^.*$/, "$1"), //session cookie
            firstValue = false, //assumed default viewport
            windowWidth = $(window).width(),

            //array
            tempLi,
            tempButton;

        $.getJSON('../styleguide_config.txt', function (data) {
            //viewport dropdown buttons generator
            $.each(data.resolutions, function (index, value) {
                if (firstValue === false) {
                    firstValue = value;
                }
                tempLi = $('<li></li>');
                tempButton = $('<button type="button" data-size="' + value + '">' + value + ' px</button>');
                tempLi
                    .append(tempButton)
                    .appendTo(mediaList);
                tempButton.on('click', function () {
                    defaultResolutionsHandler(value);
                });
            });

            //init value
            if (mediaCookie !== "") {
                firstValue = parseFloat(mediaCookie);
            }
            if(firstValue < 320 || firstValue === "" || isNaN(firstValue)) {
                firstValue = 320;
            }
            if (firstValue + 100 + 20 > windowWidth) {
                firstValue = windowWidth - 100 - 20;
            }

            if (mediaCookie === "") {
                document.cookie = "styleguideMedia=" + firstValue + "; path=/";
                customInput.val(firstValue);
                defaultResolution = firstValue;
            } else {
                customInput.val(mediaCookie);
                defaultResolution = firstValue;
            }
        });

        //viewport input field events
        function customInputEvents (event) {
            var width = $(this).val();
            width = parseInt(width);

            if (event.keyCode === 38 && event.type === "keydown") {
                event.preventDefault(); //prevents caret jumping when at the end
                width++;
                customInput.val(width);
            } else if (event.keyCode === 40 && event.type === "keydown") {
                event.preventDefault(); //prevents caret jumping when at the end
                width--;
                customInput.val(width);
            }

            defaultResolutionsHandler(width, true);
        }
        customInput.on('keydown change keyup', customInputEvents);

        //resize event to keep iframes smaller than screen
        $(window).on('resize', function () {
            $(".js-snippet").each(function (index, value) {
                var currentSnippet = $(value),
                    iframeJQ = currentSnippet.find('iframe'),
                    iframeJS = iframeJQ.get(0),
                    snippetWidth = parseFloat(currentSnippet.find('.js-snippet-preview').css('width')),
                    resizeWindowWidth = $(window).width(),
                    width;

                if (snippetWidth + 100 > resizeWindowWidth) {
                    width = resizeWindowWidth - 100;
                    iframeJS.style.width = width;
                    currentSnippet
                        .find('.js-snippet-preview')
                        .css('width', width)
                        .end()
                        .find('.js-snippet-size')
                        .text(width + 'px')
                        .end()
                        .find('.js-resize-length')
                        .css('width', parseInt(width / 2, 10));

                    snippetActions.handleHeights(iframeJQ);
                }
            });
        });
    };

    window.onpopstate = function (event) {
        redrawPage(event.state.id);
    };

    var openDropdown = function () {
        var trigger = $('.js-open-dropdown'),
            dropdown = $('.js-dropdown-list');

        trigger.on('click', function () {
            var self = $(this);

            function eventOff () {
                self
                    .removeClass('active')
                    .next(dropdown)
                    .removeClass('active');
                $(window).off('click.notButton');
            }

            if (!self.hasClass('active')) {
                self
                    .addClass('active')
                    .next(dropdown)
                    .addClass('active');
                setTimeout(function () {
                    $(window).on('click.notButton', function () {
                        eventOff();
                    });
                }, 5);
            } else {
                eventOff();
            }
        });
    };

    var newSnippetControls = function () {
        var $newSnippetForm = $(".js-new-snippet-form"),
            $newSnippetBtnOpen = $(".js-header-new-snippet"),
            $newSnippetCancel = $(".js-new-snippet-cancel");

        //module 'new snippet' button
        $newSnippetBtnOpen.on("click", function () {
            $newSnippetForm.toggleClass("active");

            ace
                .edit('jsNewCss')
                .resize();
            ace
                .edit('jsNewCode')
                .resize();
        });

        //module 'cancel' button for new snippet creation
        $newSnippetCancel.on("click", function () {
            $newSnippetForm.removeClass("active");
        });
    };

    var initSnippetService = function () {
        snippetService.init(function (data) {
            if (typeof data === 'string') {
                isServerOn = false;
                console.log(data); //server is down
            } else {
                isServerOn = true;
                $('html').addClass('server-on');
                $('.js-scrape-snipp').on('click', $.proxy(snippetActions.scrapeHandler, null, 'snippets'));
                $('.js-scrape-sass').on('click', $.proxy(snippetActions.scrapeHandler, null, 'sass'));
                $('.js-create-snippet').submit({isNew: true}, snippetActions.createEditSnippet);
                newSnippetControls();
                deletedSnippetsNav();

                if (data) {
                    $.openModal({
                        title: 'Found Duplicates!',
                        width: 500,
                        content: '<p>Found duplicates!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>'
                    });
                }
            }
        });
    };

    var deletedSnippetsNav = function () {
        $('.js-deleted-snippets').on('click', bindNavClick);
    };

    module.init = function () {
        editorService.init();
        bindResolutionActions();
        buildNavigation($('.js-navigation'), '.js-navigation-list', true);
        buildNavigation($('.js-home-navigation'), '.js-navigation-list', false);
        categoryService.bindCategoriesToForm($('.js-form-select').first());
        initSnippetService();
        openDropdown();
    };

    module.getCurrentView = function () {
        return currentView;
    };

    module.getDefaultResolution = function () {
        return defaultResolution;
    };

    return module;
})(jQuery || {}, editorService, sassService, categoryService, snippetService);