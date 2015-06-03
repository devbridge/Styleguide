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

  return module;
})(jQuery || {});