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

    var bindCategoryButtons = function () {
        var currentViewIndex = $.inArray(currentView, views),
            btnNext = $('.js-next-cat'),
            btnPrev = $('.js-prev-cat'),
            next,
            prev;

        if (currentViewIndex === 0) {
            prev = currentViewIndex;
            next = currentViewIndex + 1;
            btnPrev.attr('disabled', true);
        } else if (currentViewIndex === views.length - 1) {
            prev = currentViewIndex - 1;
            next = currentViewIndex;
            btnNext.attr('disabled', true);
        } else {
            prev = currentViewIndex - 1;
            next = currentViewIndex + 1;
            btnNext.removeAttr('disabled');
            btnPrev.removeAttr('disabled');
        }

        btnNext
        .data('id', views[next].id)
        .off('click')
        .on('click', bindNavClick);

        btnPrev
        .data('id', views[prev].id)
        .off('click')
        .on('click', bindNavClick);
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
            iteratingPage,
            route = window.location.hash,
            pageElement,
            navLinksArr = [],
            index,
            len;

        route = route.replace('#', '');
        currentPage.text(pages[0].name);

        categoryService.getCategories(function (categories) {
            views = pages = pages.concat(categories);
            pages.push({
                name: 'Deleted Snippets',
                id: 'deleted'
            });

            len = pages.length;

            navList.on('added:element', function () {
                if (navLinksArr.length === pages.length) {
                    sortAndAppendLinks(navList, navLinksArr);
                }
            });

            for (index = 0; len > index; index++) {
                iteratingPage = pages[index];
                snippetService.getCategoryItemsCount(iteratingPage, function (count, category) {
                    if (category.name === pages[0].name) {
                        pageElement = $('<button class="active" type="button" data-id="' + category.id + '">' + category.name + '</button>');
                    } else {
                        pageElement = $('<button type="button" data-id="' + category.id + '">' + category.name + '</button>');
                    }

                    pageElement.on('click', bindNavClick);

                    if (category.name === 'undefined') {
                        pageElement.addClass('snippet-undefined-category');
                    }

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

            if (refreshContent === true) {
                redrawPage(currentView.id);
            }
        });
    };

    var redrawPage = function (categoryId) {
        var snippetResizeControls = $('.js-snippet-resize-controls'),
            homeNavigation = $('.js-home-navigation'),
            currentPage = $('.js-current-page');

        $('.main').empty();

        function snippetsPage() {
            currentPage.text(currentView.name);
            bindCategoryButtons();
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
            bindCategoryButtons();
            snippetResizeControls.hide();
            homeNavigation.show();
            currentPage.text(currentView.name);
            sassService.loadSass();

            // init home navigation when content is loaded
            $(window).load(function () {
                buildNavigation($('.js-home-navigation'), '.js-navigation-list', false);
            });

            // init home navigation when going backwards to home page
            buildNavigation($('.js-home-navigation'), '.js-navigation-list', false);
        }
    };

    var defaultResolutionsHandler = function (width, button, fromInput) {
        var iFrames = $('iframe'),
            iFramesArray = iFrames.get(),
            len = iFramesArray.length,
            index,
            updateField = fromInput ? false : true;

        if (width < 320 || width === "" || isNaN(width)) {
            width = 320;
        }

        $('.header-size-controls')
        .find('.btn-ghost')
        .removeClass('active');
        $(button).addClass('active');

        for (index = 0; index < len; index++) {
            iFramesArray[index].style.width = width;
        }

        $('.js-snippet-preview').css('width', width);
        $('.js-snippet-size').text(width + 'px');
        $('.js-resize-length').css('width', parseInt(width / 2, 10));
        if (updateField === true) {
            $('.js-custom-media').val(width);
        }
        document.cookie = "styleguideMedia=" + width + "; path=/";
        defaultResolution = width;

        snippetActions.handleHeights(iFrames);
    };

    var bindResolutionActions = function () {
        var customInput = $('.js-custom-media'),
            mediaList = $('.js-media-list'),
            tempLi,
            tempButton,
            mediaCookie = document.cookie.replace(/(?:(?:^|.*;\s*)styleguideMedia\s*\=\s*([^;]*).*$)|^.*$/, "$1"), //session cookie
            firstValue = false; //assumed default viewport

        $.getJSON('../styleguide/config.txt', function (data) {

            $.each(data.viewportWidths, function (index, value) {
                if (firstValue === false) {
                    firstValue = value;
                }
                tempLi = $('<li></li>');
                tempButton = $('<button type="button" data-size="' + value + '">' + value + ' px</button>');
                tempLi
                .append(tempButton)
                .appendTo(mediaList);
                tempButton.on('click', function () {
                    defaultResolutionsHandler(value, tempButton);
                });
            });

            if (firstValue < 320 || firstValue === "" || isNaN(firstValue)) {
                firstValue = 320;
            }

            if (mediaCookie === "") {
                document.cookie = "styleguideMedia=" + firstValue + "; path=/";
                customInput.val(firstValue);
                defaultResolution = firstValue;
            } else {
                customInput.val(mediaCookie);
                defaultResolution = mediaCookie;
            }
        });

        function customInputEvent(event) {
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

            defaultResolutionsHandler(width, event.target, true);
        }

        customInput.on('keydown change keyup', customInputEvent);
    };

    window.onpopstate = function (event) {
        redrawPage(event.state.id);
    };

    var openDropdown = function () {
        var trigger = $('.js-open-dropdown'),
            dropdown = $('.js-dropdown-list'),
            self;

        trigger.on('click', function (event) {
            event.stopPropagation();
            self = $(this);

            if (!self.hasClass('active')) {
                dropdown.removeClass('active');
                self
                .addClass('active')
                .next(dropdown)
                .addClass('active');
            } else {
                self
                .removeClass('active')
                .next(dropdown)
                .removeClass('active');
            }
        });

        //TODO revisit: event is always available
        $(window).on('click', function () {
            trigger.removeClass('active');
            dropdown.removeClass('active');
        });
    };

    var newSnippetControls = function () {
        var $newSnippetForm = $(".js-new-snippet-form"),
            $newSnippetBtnOpen = $(".js-header-new-snippet"),
            $newSnippetCancel = $(".js-new-snippet-cancel");

        //module 'new snippet' button
        $newSnippetBtnOpen.on("click", function () {
            $newSnippetForm.toggle();
        });

        //module 'cancel' button for new snippet creation
        $newSnippetCancel.on("click", function () {
            $newSnippetForm.hide();
        });
    };

    module.init = function () {
        editorService.init();
        bindResolutionActions();
        buildNavigation($('.js-navigation'), '.js-navigation-list', true);
        categoryService.bindCategoriesToForm($('.js-form-select').first());
        openDropdown();
        newSnippetControls();

        snippetService.init(function (data) {
            if (typeof data === 'string') {
                isServerOn = false;
                console.log(data); //server is down
            } else {
                isServerOn = true;
                $('html').addClass('server-on');
                $('.js-scrape-snipp').on('click', $.proxy(snippetActions.scrapeHandler, null, 'snippets'));
                $('.js-scrape-sass').on('click', $.proxy(snippetActions.scrapeHandler, null, 'sass'));
                if (data) {
                    $.openModal({
                        title: 'Found Duplicates!',
                        width: 500,
                        content: '<p>Found duplicates!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>'
                    });
                }
            }
        });

        $('.js-create-snippet').submit(snippetActions.createSnippet);
    };

    module.getCurrentView = function () {
        return currentView;
    };

    module.getDefaultResolution = function () {
        return defaultResolution;
    };

    return module;
})(jQuery || {}, editorService, sassService, categoryService, snippetService);