var viewService = (function ( $, editorService, sassService, categoryService ) {
  var module = {},
      views,
      currentView;

  var buildNavigation = function () {
    var navigation = $('.js-navigation'),
      currentPage = navigation.find('.js-current-page'),
      navList = navigation.find('.js-navigation-list'),
      pages = [{ name: 'Colors, Typography', id: 'sass' }],
      iteratingPage,
      pageElement,
      index,
      len;

    currentPage.text(pages[0].name);
    categoryService.getCategories(function ( categories ) {
      views = pages = pages.concat(categories);
      pages.push({ name: 'Deleted Snippets', id: 'deleted'});
      len = pages.length;

      for (index = 0; len > index; index++) {
        iteratingPage = pages[index];
        pageElement = $('<a href="#" data-id="' + iteratingPage.id + '">' + iteratingPage.name + '</a>');
        pageElement.on('click', function () {
          redrawPage($(this).data('id'));
        });
        navList.append(pageElement);
      }

      currentView = views[0]
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

  module.init = function () {
    editorService.init();
    buildNavigation();
    sassService.loadSass();
    categoryService.bindCategoriesToForm($('.js-form-select').first());
    $('.js-create-snippet').submit(snippetActions.createSnippet);
  };

  module.getCurrentView = function () {
    return currentView;
  };

  return module;
})(jQuery || {}, editorService, sassService, categoryService);