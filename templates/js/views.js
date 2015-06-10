var viewService = (function ( $, editorService, sassService, categoryService, snippetService ) {
  var module = {},
      views,
      currentView,
      currentRoute,
      isServerOn;

  var setLastView = function () {};

  var buildNavigation = function () {
    var navigation = $('.js-navigation'),
      currentPage = navigation.find('.js-current-page'),
      navList = navigation.find('.js-navigation-list'),
      pages = [{ name: 'Colors, Typography', id: 'sass' }],
      iteratingPage,
      route = window.location.hash,
      pageElement,
      index,
      len;

    route = route.replace('#', '');
    currentPage.text(pages[0].name);
    categoryService.getCategories(function ( categories ) {
      views = pages = pages.concat(categories);
      pages.push({ name: 'Deleted Snippets', id: 'deleted'});
      len = pages.length;

      for (index = 0; len > index; index++) {
        iteratingPage = pages[index];
        pageElement = $('<a href="#" data-id="' + iteratingPage.id + '">' + iteratingPage.name + '</a>');
        pageElement.on('click', function ( e ) {
          var id = $(this).data('id')
          e.preventDefault();
          redrawPage(id);
          window.history.pushState({ id: id }, '', '#' + id);
        });
        navList.append(pageElement);
      }

      if ( route.length ) {
        currentView = $.grep(views, function ( el ) {
          return el.id == route;
        }).pop();
      } else {
        currentView = views[0];
        window.history.replaceState({ id: currentView.id }, '', '')
      }

      redrawPage(currentView.id);
    });
  };

  var redrawPage = function ( categoryId ) {
    var sassContent = $($('#sass-page').html());
    $('.main').empty();
  
    if ( typeof categoryId === 'number' ) {
      currentView = $.grep(views, function ( el ) {
        return el.id == categoryId;
      }).pop();

      $('.js-current-page').text(currentView.name);

      iframesService.formFramesForCategory(categoryId, function ( frames, snippets ) {
        snippetActions.drawSnippets(frames, snippets);
      });

      return;
    }

    if ( typeof categoryId === 'string' && categoryId === 'deleted' ) {
      currentView = views[views.length - 1];
      $('.js-current-page').text(currentView.name);

      iframesService.formFramesForDeleted(function ( frames, snippets ) {
        snippetActions.drawSnippets(frames, snippets);
      });
      return;
    }
    
    currentView = views[0]
    $('.js-current-page').text(currentView.name);
    $('.main').append(sassContent);
    sassService.loadSass();
  };

  window.onpopstate = function(event) {
    redrawPage(event.state.id);
  };

  module.init = function () {
    editorService.init();
    buildNavigation();
    categoryService.bindCategoriesToForm($('.js-form-select').first());

    snippetService.init(function ( data ) {
      if (typeof data === 'string') {
        isServerOn = false;
        console.log(data); //server is down
      } else {
        isServerOn = true;
        $('.js-scrape-snipp').on('click', $.proxy(snippetActions.scrapeHandler, null, 'snippets'));
        $('.js-scrape-sass').on('click', $.proxy(snippetActions.scrapeHandler, null, 'sass'));
        if ( data ) {
          alert('Found duplicates!\n' + JSON.stringify(data, null, 4));
        }
      }
    });

    $('.js-create-snippet').submit(snippetActions.createSnippet);
  };

  module.getCurrentView = function () {
    return currentView;
  };

  return module;
})(jQuery || {}, editorService, sassService, categoryService, snippetService);