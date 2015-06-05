var categoryService = (function ($) {
  var module = {},
      cachedCategories;

  module.getCategories = function ( callback ) {
    if ( !cachedCategories ) {
      $.getJSON('../styleguide_config.txt', function ( data ) {
        cachedCategories = data.categories;
        callback(cachedCategories);
      });
    } else {
      callback(cachedCategories);
    }
  };

  module.bindCategoriesToForm = function ( selection ) {
    module.getCategories(function ( categories ) {
      categories = categories.map(function ( category ) {
        return '<option value="' + category.id + '">' + category.name + '</option>';
      });
      selection.html(categories.join(''));
    });
  };

  return module;
})(jQuery || {});