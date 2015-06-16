var viewService = (function($, editorService, sassService, categoryService, snippetService) {
  var module = {},
    views,
    currentView,
    defaultResolution,
    isServerOn;

  var bindNavClick = function(e) {
    var id = $(this).data('id');
    e.preventDefault();
    redrawPage(id);
    window.history.pushState({
      id: id
    }, '', '#' + id);
  };

  var bindCategoryButtons = function() {
    var currentViewIndex = $.inArray(currentView, views),
      next,
      prev;

    if (currentViewIndex === 0) {
      prev = currentViewIndex;
      next = currentViewIndex + 1;
    } else if (currentViewIndex === views.length - 1) {
      prev = currentViewIndex - 1;
      next = currentViewIndex;
    } else {
      prev = currentViewIndex - 1;
      next = currentViewIndex + 1;
    }

    $('.js-next-cat').data('id', views[next].id);
    $('.js-prev-cat').data('id', views[prev].id);

    $('.js-next-cat').off('click');
    $('.js-prev-cat').off('click');

    $('.js-next-cat').on('click', bindNavClick);
    $('.js-prev-cat').on('click', bindNavClick);
  };

  var buildNavigation = function() {
    var navigation = $('.js-navigation'),
      currentPage = navigation.find('.js-current-page'),
      navList = navigation.find('.js-navigation-list'),
      pages = [{
        name: 'Colors, Typography',
        id: 'sass'
      }],
      iteratingPage,
      route = window.location.hash,
      pageElement,
      index,
      len;

    route = route.replace('#', '');
    currentPage.text(pages[0].name);
    categoryService.getCategories(function(categories) {
      views = pages = pages.concat(categories);
      pages.push({
        name: 'Deleted Snippets',
        id: 'deleted'
      });
      len = pages.length;

      for (index = 0; len > index; index++) {
        iteratingPage = pages[index];
        pageElement = $('<a href="#" data-id="' + iteratingPage.id + '">' + iteratingPage.name + '</a>');
        pageElement.on('click', bindNavClick);
        navList.append(pageElement);
      }

      if (route.length) {
        currentView = $.grep(views, function(el) {
          return el.id == route;
        }).pop();
      } else {
        currentView = views[0];
        window.history.replaceState({
          id: currentView.id
        }, '', '');
      }

      redrawPage(currentView.id);
    });
  };

  var redrawPage = function(categoryId) {
    $('.main').empty();

    if (typeof categoryId === 'number') {
      currentView = $.grep(views, function(el) {
        return el.id === categoryId;
      }).pop();

      $('.js-current-page').text(currentView.name);

      iframesService.formFramesForCategory(categoryId, function(frames, snippets) {
        snippetActions.drawSnippets(frames, snippets, defaultResolution);
      });

      bindCategoryButtons();

      return;
    }

    if (typeof categoryId === 'string' && categoryId === 'deleted') {
      currentView = views[views.length - 1];
      $('.js-current-page').text(currentView.name);

      iframesService.formFramesForDeleted(function(frames, snippets) {
        snippetActions.drawSnippets(frames, snippets, defaultResolution);
      });

      bindCategoryButtons();

      return;
    }

    currentView = views[0];

    bindCategoryButtons();

    $('.js-current-page').text(currentView.name);
    sassService.loadSass();
  };

  var defaultResolutionsHandler = function(width) {
    $('.js-snippet-preview').css('width', width);
    $('.js-snippet-size').val(width);
    snippetActions.handleHeights($('iframe'));
  };

  var bindResolutionActions = function() {
    var desktop,
      tablet,
      mobile;
    $.getJSON('../styleguide_config.txt', function(data) {
      defaultResolution = desktop = data.resolutions.desktop ? data.resolutions.desktop + 'px' : '1200px';
      tablet = data.resolutions.tablet ? data.resolutions.tablet + 'px' : '768px';
      mobile = data.resolutions.mobile ? data.resolutions.mobile + 'px' : '480px';

      $('.js-desktop').on('click', $.proxy(defaultResolutionsHandler, null, desktop));
      $('.js-tablet').on('click', $.proxy(defaultResolutionsHandler, null, tablet));
      $('.js-mobile').on('click', $.proxy(defaultResolutionsHandler, null, mobile));

    });

    $('.js-custom').on('keyup', function() {
      var width = $(this).val() + 'px';
      defaultResolutionsHandler(width);
    });
  };

  window.onpopstate = function(event) {
    redrawPage(event.state.id);
  };

  module.init = function() {
    editorService.init();
    bindResolutionActions();
    buildNavigation();
    categoryService.bindCategoriesToForm($('.js-form-select').first());

    snippetService.init(function(data) {
      if (typeof data === 'string') {
        isServerOn = false;
        console.log(data); //server is down
      } else {
        isServerOn = true;
        $('html').addClass('server-on');
        $('.js-scrape-snipp').on('click', $.proxy(snippetActions.scrapeHandler, null, 'snippets'));
        $('.js-scrape-sass').on('click', $.proxy(snippetActions.scrapeHandler, null, 'sass'));
        if (data) {
          alert('Found duplicates!\n' + JSON.stringify(data, null, 4));
        }
      }
    });

    $('.js-create-snippet').submit(snippetActions.createSnippet);
  };

  module.getCurrentView = function() {
    return currentView;
  };

  return module;
})(jQuery || {}, editorService, sassService, categoryService, snippetService);