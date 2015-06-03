var categoryService = (function ($) {
  var module = {},
      cachedCategories;

  module.getCategories = function ( callback ) {
    if ( !cachedCategories ) {
      $.getJSON('../../../config.txt', function ( data ) {
        cachedCategories = data.categories;
        callback(cachedCategories);
      });
    } else {
      callback(cachedCategories);
    }
  };

  module.bindCategoriesToForms = function () {
    var selections = $('.js-form-select'),
        len = selections.length,
        index,
        currentSelection;
    module.getCategories(function ( categories ) {
      categories = categories.map(function ( category ) {
        return '<option value="' + category.id + '">' + category.name + '</option>';
      });
      for (index = 0; index < len; index++) {
        currentSelection = $(selections[index]);
        currentSelection.html(categories.join(''));
      }
    });
  };

  return module;
})(jQuery || {});