var viewService = (function ($, editorService, sassService, categoryService, snippetService) {
    var module = {},
        views,
        currentView,
        defaultResolution,
        isServerOn;

    var bindNavClick = function (e) {
        var id = $(this).data('id');
        e.preventDefault();
        redrawPage(id);
        window.history.pushState({
            id: id
        }, '', '#' + id);
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

        btnNext.data('id', views[next].id);
        btnPrev.data('id', views[prev].id);

        btnNext.off('click');
        btnPrev.off('click');

        btnNext.on('click', bindNavClick);
        btnPrev.on('click', bindNavClick);
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
            navLinksArr[index].element.wrap("<li></li>");
        }
    };

    var buildNavigation = function (navigation, list, refreshContent) {
        var currentPage = navigation.find('.js-current-page'),
            navList = navigation.find(list),
            pages = [{
                name: 'Colors, Typography',
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
                    if(category.name === pages[0].name) {
                        pageElement = $('<button class="active" type="button" data-id="' + category.id + '">' + category.name + '</button>');
                    } else {
                        pageElement = $('<button type="button" data-id="' + category.id + '">' + category.name + '</button>')
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
                window.history.replaceState({
                    id: currentView.id
                }, '', '');
            }

            if(refreshContent === true) {
                redrawPage(currentView.id);
            }
        });
    };

    var redrawPage = function (categoryId) {
        var snippetResizeControls = $('.js-snippet-resize-controls'),
            homeNavigation = $('.js-home-navigation');

        $('.main').empty();

        if (typeof categoryId === 'number') {
            currentView = $.grep(views, function (el) {
                return el.id === categoryId;
            }).pop();

            $('.js-current-page').text(currentView.name);

            iframesService.formFramesForCategory(categoryId, function (frames, snippets) {
                snippetActions.drawSnippets(frames, snippets, defaultResolution);
            });

            bindCategoryButtons();
            snippetResizeControls.show();
            homeNavigation.hide();

            return;
        }

        if (typeof categoryId === 'string' && categoryId === 'deleted') {
            currentView = views[views.length - 1];
            $('.js-current-page').text(currentView.name);

            iframesService.formFramesForDeleted(function (frames, snippets) {
                snippetActions.drawSnippets(frames, snippets, defaultResolution);
            });

            bindCategoryButtons();
            snippetResizeControls.show();
            homeNavigation.hide();

            return;
        }

        currentView = views[0];

        bindCategoryButtons();

        snippetResizeControls.hide();
        homeNavigation.show();

        $('.js-current-page').text(currentView.name);
        sassService.loadSass();
    };

    var defaultResolutionsHandler = function (width, button) {
        var iframe = $('iframe').get(),
            len = iframe.length,
            index;

        $('.header-size-controls').find('.btn-ghost').removeClass('active');
        $(button).addClass('active');

        for (index = 0; index < len; index++) {
            iframe[index].style.width = width;
        }

        $('.js-snippet-preview').css('width', width);

        $('.js-snippet-size').text(width);
        $('.js-custom').val(width);

        snippetActions.handleHeights($('iframe'));
    };

    var bindResolutionActions = function () {
        var desktop,
            tablet,
            mobile,
            desktopButton = $('.js-desktop'),
            tabletButton = $('.js-tablet'),
            mobileButton = $('.js-mobile'),
            customInput = $('.js-custom');
        $.getJSON('../styleguide_config.txt', function (data) {
            defaultResolution = desktop = data.resolutions.desktop ? data.resolutions.desktop : '1200';
            tablet = data.resolutions.tablet ? data.resolutions.tablet : '768';
            mobile = data.resolutions.mobile ? data.resolutions.mobile : '480';

            customInput.val(defaultResolution);

            desktopButton.on('click', function () {
                defaultResolutionsHandler(desktop, desktopButton);
            });


            tabletButton.on('click', function () {
                defaultResolutionsHandler(tablet, tabletButton);
            });

            mobileButton.on('click', function () {
                defaultResolutionsHandler(mobile, mobileButton);
            });

        });

        customInput.on('keyup', function (event) {
            var width = $(this).val();
            width = parseInt(width);

            if (event.keyCode === 38) {
                width += 1;
                defaultResolutionsHandler(width, event.target);
            } else if (event.keyCode === 40) {
                width -= 1;
                defaultResolutionsHandler(width, event.target);
            }
        });

        customInput.on('change', function (event) {
            var width = $(this).val();
            width = parseInt(width);

            if (event.keyCode === 38) {
                width += 1;
            } else if (event.keyCode === 40) {
                width -= 1;
            }

            defaultResolutionsHandler(width, event.target);
        });
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
                self.addClass('active');
                dropdown.removeClass('active');
                self.next(dropdown).addClass('active');
            } else {
                self.removeClass('active');
                self.next(dropdown).removeClass('active');
            }
        });

        $(window).on('click', function () {
            trigger.removeClass('active');
            dropdown.removeClass('active');
        });
    };

    module.init = function () {
        editorService.init();
        bindResolutionActions();
        buildNavigation($('.js-navigation'), '.js-navigation-list', true);
        buildNavigation($('.js-home-navigation'), '.js-navigation-list', false);
        categoryService.bindCategoriesToForm($('.js-form-select').first());
        openDropdown();

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