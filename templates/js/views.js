var viewService = (function ( $, editorService, sassService, categoryService ) {
  var module = {},
      currentView;

  var buildNavigation = function () {
    var navigation = $('.js-navigation'),
      currentPage = navigation.find('.js-current-page'),
      navList = navigation.find('.js-navigation-list'),
      pages = [{ name: 'Colors, Typography' }],
      iteratingPage,
      pageElement,
      index,
      len;

    currentPage.text(pages[0].name);
    categoryService.getCategories(function ( categories ) {
      pages = pages.concat(categories);
      len = pages.length;

      for (index = 0; len > index; index++) {
        iteratingPage = pages[index];
        pageElement = $('<a href="#" data-id="' + iteratingPage.id + '">' + iteratingPage.name + '</a>');
        pageElement.on('click', function () {
          redrawPage($(this).data('id'));
        });
        navList.append(pageElement);
      }
    });
  };

  var redrawPage = function ( categoryId ) {
    var sassContent = $($('#sass-page').html());
    $('.main').empty();
  
    if ( typeof categoryId === 'number' ) {
      iframesService.formFramesForCategory(categoryId, function ( frames, snippets ) {
        snippetActions.drawSnippets(frames, snippets);
      });
      return;
    }
  
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

  return module;
})(jQuery || {}, editorService, sassService, categoryService);