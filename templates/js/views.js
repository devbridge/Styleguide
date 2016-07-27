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

        categoryService.getCategories(function (categories) {
            views = pages = pages.concat(categories);

            len = pages.length;

            navList.empty();

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

            for (index = 0; len > index; index++) {
                iteratingPage = pages[index];
                if (iteratingPage.id === 'sass') {
                    pageElement = $('<button type="button" class="active" data-id="' + iteratingPage.id + '">' + iteratingPage.name + '</button>');
                } else {
                    pageElement = $('<button type="button" data-id="' + iteratingPage.id + '">' + iteratingPage.name + '</button>');
                }

                pageElement.on('click', bindNavClick);

                navLinksArr.push({
                    element: pageElement,
                    category: iteratingPage
                });
            }

            sortAndAppendLinks(navList, navLinksArr);

            if (refreshContent === true) {
                redrawPage(currentView.id);
            }
        });
    };

    var redrawPage = function (categoryId) {
        var snippetResizeControls = $('.js-sg-snippets-resize'),
            introContainer = $('.js-intro-container'),
            currentPage = $('.js-current-page');

        $('.main').empty();

        function snippetsPage() {
            currentPage.text(currentView.name);
            snippetResizeControls.show();
        }

        if (categoryId === 'sass') {
            introContainer.show();
        } else {
            introContainer.hide();
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

        $.getJSON('./config.txt', function (data) {
            $.each(data.viewportWidths, function (index, value) {
                if (firstValue === false) {
                    firstValue = data.viewportWidths[data.viewportWidths.length - 1];
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
                firstValue = 1200;
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
            $newSnippetCancel = $(".js-new-snippet-cancel"),
            $tabAction = $(".js-snippet-tab-action"),
            $tabSource = $(".js-snippet-tab-src");

        //module 'new snippet' button
        $newSnippetBtnOpen.on("click", function () {

            $newSnippetForm.toggleClass("active");

            ace
                .edit('jsNewCss')
                .resize();
            ace
                .edit('jsNewCode')
                .resize();
            setTimeout(function () {
                $('#new-name').focus();
            }, 200);
        });

        $tabAction.on('click', function () {
            var self = $(this),
                id = self.attr('data-target');

            if (id) {
                $tabAction.parent().removeClass('is-active');
                self.parent().addClass('is-active');

                $tabSource.removeClass('is-active');
                $('#' + id).addClass('is-active');
            }
        });

        //module 'cancel' button for new snippet creation
        $newSnippetCancel.on("click", function () {
            $newSnippetForm.removeClass("active");
        });
    };

    var categoriesUpdateActions = function () {
        buildNavigation($('.js-navigation'), '.js-navigation-list', true);
        buildNavigation($('.js-home-navigation'), '.js-navigation-list', false);
        categoryService.bindCategoriesToForm($('.js-form-select').first());
    };

    var categoryControls = function () {
        var categoriesButton = $(".js-categories-button"),
            modalContent;

        function categoryMarkup (name, id, editMode) {
            //elements
            var categoryLine = $('<li class="sg-category-line" data-category-id="' + id +'"></li>'),

                categoryInputWrapper = $('<div class="sg-field-wrapper"></div>'),
                categoryName = $('<input placeholder="Category Name" class="sg-category-name" type="text" value="' + name + '" readonly>'),

                categoryControls = $('<div class="sg-category-controls sg-opened"></div>'),
                categoryControlsInner = $('<div class="sg-category-controls-inner"></div>'),
                categoryDelete = $('<button class="sg-category-button sg-delete" type="button">Delete</button>'),
                categoryEdit = $('<button class="sg-category-button sg-edit" type="button">Edit</button>'),

                categoryDeleteWrapper = $('<div class="sg-category-controls"></div>'),
                categoryDeleteInnerWrapper = $('<div class="sg-category-controls-inner"></div>'),
                categoryDeleteConfirm = $('<button class="sg-category-button sg-negative" type="button">Delete</button>'),
                categoryDeleteCancel = $('<button class="sg-category-button sg-cancel" type="button">Cancel</button>'),

                categoryEditWrapper = $('<div class="sg-category-controls"></div>'),
                categoryEditInnerWrapper = $('<div class="sg-category-controls-inner"></div>'),
                categoryEditConfirm = $('<button class="sg-category-button sg-positive" type="button">Save</button>'),
                categoryEditCancel = $('<button class="sg-category-button sg-cancel" type="button">Cancel</button>');


            //TODO edit mode on field focus: enter = save, esc = cancel
            //delete workflow
            categoryDelete.on('click', function () {
                categoryDeleteWrapper.addClass("sg-opened");
                categoryName.focus();
                categoryControls.addClass("sg-hidden");
            });

            categoryDeleteCancel.on('click', function () {
                categoryDeleteWrapper.removeClass("sg-opened");
                categoryName.focus();
                categoryControls.removeClass("sg-hidden");
            });

            categoryDeleteConfirm.on('click', function () {
                categoryService.deleteById(id, function (data) {
                    if (typeof data === 'string') {
                        module
                            .notifications
                            .pushMessage("Category Deletion: " + data);
                    } else {
                        categoriesUpdateActions();
                        module
                            .notifications
                            .pushMessage("Category Deleted!");
                        categoryLine.remove();
                        categoryControls.removeClass("sg-hidden");
                    }
                });
            });

            //edit workflow
            function inputKeyboardEvents (event) {
                if (event.keyCode === 13) {
                    event.stopPropagation();
                    categoryEditConfirm.click();
                } else if (event.keyCode === 27) {
                    event.stopPropagation();
                    categoryEditCancel.click();
                }
            }

            categoryEdit.on('click', function () {
                categoryEditWrapper.addClass("sg-opened");
                categoryName
                    .removeAttr("readonly")
                    .focus();
                categoryControls.addClass("sg-hidden");

                setTimeout(function () {
                    categoryName.on("keydown keyup", inputKeyboardEvents);
                }, 250);
            });

            categoryEditCancel.on('click', function () {
                categoryEditWrapper.removeClass("sg-opened");
                categoryName
                    .attr("readonly", "")
                    .focus();
                categoryControls.removeClass("sg-hidden");
                setTimeout(function () {
                    categoryName.off("keydown keyup", inputKeyboardEvents);
                }, 250);

                categoryName.val(name);
            });

            categoryEditConfirm.on('click', function () {
                categoryService.save({
                    id: id,
                    name: categoryName.val()
                }, function (data) {
                    if (typeof data === 'string') {
                        module
                            .notifications
                            .pushMessage("Category Save: " + data);
                        categoryName.val(name);
                    } else {
                        categoryEditWrapper.removeClass("sg-opened");
                        categoryName
                            .attr("readonly", "")
                            .focus();
                        categoryControls.removeClass("sg-hidden");
                        setTimeout(function () {
                            categoryName.off("keydown keyup", inputKeyboardEvents);
                        }, 250);
                        id = data.id;
                        name = data.name;
                        categoryName.val(data.name);
                        categoriesUpdateActions();
                        module
                            .notifications
                            .pushMessage("Category Save: Successfully Saved!");
                    }
                });
            });

            //construction
            categoryInputWrapper
                .append(categoryName);
            categoryControlsInner
                .append(categoryDelete)
                .append(categoryEdit)
                .appendTo(categoryControls);
            categoryDeleteInnerWrapper
                .append(categoryDeleteConfirm)
                .append(categoryDeleteCancel)
                .appendTo(categoryDeleteWrapper);
            categoryEditInnerWrapper
                .append(categoryEditConfirm)
                .append(categoryEditCancel)
                .appendTo(categoryEditWrapper);

            categoryLine
                .append(categoryInputWrapper)
                .append(categoryControls)
                .append(categoryDeleteWrapper)
                .append(categoryEditWrapper);

            if (editMode === true) {
                setTimeout(function () {
                    categoryEdit.click();
                }, 50);
            }

            return categoryLine;
        }

        categoriesButton.on("click", function () {
            categoryService.getCategories(function (categories) {
                var categoriesList = $('<ul class="sg-categories-list"></ul>'),
                    categoryAddButton = $('<button class="sg-button-add">Add Category</button>');
                modalContent = $("<div></div>");

                categoryAddButton.on('click', function () {
                    categoriesList.append(categoryMarkup('', undefined, true));
                });

                $.each(categories, function (index, value) {
                    categoriesList.append(categoryMarkup(value.name, value.id, false));
                });

                modalContent.append(categoriesList);
                modalContent.append(categoryAddButton);

                $.openModal({
                    title: 'Categories',
                    width: 750,
                    content: modalContent
                });
            });
        });
    };

    var deletedSnippetsNav = function () {
        $('.js-deleted-snippets').on('click', bindNavClick);
    };

    var styleguideLogoNav = function () {
        $('.js-styleguide-logo').on('click', bindNavClick);
    };

    var initSnippetService = function () {
        snippetService.init(function (data) {
            if (typeof data === 'string') {
                isServerOn = false;
                console.log(data); // server is down
            } else {
                isServerOn = true;
                console.log('EDIT MODE - Server is running'); // server is running

                $('html').addClass('server-on');

                //commented these, these will be improved and enabled after initial release
                //$('.js-scrape-snipp').on('click', $.proxy(snippetActions.scrapeHandler, null, 'snippets'));
                $(document).on('click', '.js-scrape-sass', $.proxy(snippetActions.scrapeHandler, null, 'sass'));
                $('.js-create-snippet').submit({isNew: true}, snippetActions.createEditSnippet);
                newSnippetControls();
                categoryControls();
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

    module.notifications = {
        notificationsContainer: $(".js-notifications"),
        template: '' +
            '<div class="sg-notification-item js-notification-item">' +
                '<span class="sg-notification-item-text">{{message}}</span>' +
            '</div>',
        pushMessage: function (message) {
            var currentMessage = $(module.notifications.template.replace('{{message}}', message)),
                localTimeout;

            function activateTimeout (miliseconds) {
                localTimeout = setTimeout(function () {
                    //remove element and events
                    currentMessage
                        .remove();
                    module
                        .notifications
                        .notificationsContainer
                        .off("mouseover", removeTimeout)
                        .off("mouseout", reactiveTimeout)
                        .find(".js-close-notifications")
                        .off("click", closeImmediately);

                    //check if it was the last item
                    if (module.notifications.notificationsContainer.find("> .js-notification-item").length === 0) {
                        module
                            .notifications
                            .notificationsContainer
                            .removeClass("show removing-5 removing-10")
                            .addClass("quick-opacity");
                    }
                }, miliseconds);
            }

            //mouse over wrapper - opacity to 1 and all items stay in place
            function removeTimeout () {
                module
                    .notifications
                    .notificationsContainer
                    .removeClass("removing-5 removing-10")
                    .addClass("quick-opacity");
                clearTimeout(localTimeout);
            }

            //mouse out - opacity to .85 in 5 seconds for all items
            function reactiveTimeout () {
                module
                    .notifications
                    .notificationsContainer
                    .addClass("show removing-5")
                    .removeClass("quick-opacity");
                activateTimeout(5000);
            }

            //every item closes itself, since it is the easiest way to handle all events
            function closeImmediately () {
                activateTimeout(1);
            }

            //add new message to top
            module
                .notifications
                .notificationsContainer
                .prepend(currentMessage);

            //set wrappers opacity to 1 and go to .85 in 10 seconds
            setTimeout(function () {
                module
                    .notifications
                    .notificationsContainer
                    .addClass("show removing-10")
                    .removeClass("quick-opacity")
                    //required when there are more than one item in notifications
                    //remove transitions
                    .css({
                        "transition": "0s",
                        "-webkit-transition": "0s",
                        "-moz-transition": "0s"
                    })
                    //animate opacity to 1
                    .animate(
                        {
                            opacity: 1
                        },
                        200,
                        function () {
                            $(this).removeAttr("style"); //removes transitions and opacity from inline styles
                        }
                    );
            }, 1);

            activateTimeout(10000); // set 10 seconds until removing item

            //attach events
            module
                .notifications
                .notificationsContainer
                .on("mouseover", removeTimeout)
                .on("mouseout", reactiveTimeout)
                .find(".js-close-notifications") //todo optimize selector since it is always there
                .on("click", closeImmediately);
        }
    };

    var bindProjectInformation = function (data) {
        var $linkElement = $('.js-project-link');
        var $imgContainer = $('.js-project-logo');
        var projectName = data.projectName.length ? data.projectName : 'project name';
        var projectUrl = data.projectUrl.length ? data.projectUrl : '#nolink';
        var $image = $('<img />');

        $linkElement.text(projectName);
        $linkElement.attr('href', projectUrl);

        if (data.projectLogo.length) {
            $image.attr('src', data.projectLogo);
            $image.attr('alt', projectName);

            $imgContainer.append($image);
        }
    };

    module.init = function () {
        $.getJSON('./config.txt', function (data) {
            bindProjectInformation(data);
        });

        editorService.init();
        bindResolutionActions();
        buildNavigation($('.js-navigation'), '.js-navigation-list', true);
        buildNavigation($('.js-home-navigation'), '.js-navigation-list', false);
        categoryService.init();
        categoryService.bindCategoriesToForm($('.js-form-select').first());
        initSnippetService();
        openDropdown();
        styleguideLogoNav();
    };

    module.getCurrentView = function () {
        return currentView;
    };

    module.getDefaultResolution = function () {
        return defaultResolution;
    };

    return module;
})(jQuery || {}, editorService, sassService, categoryService, snippetService);
