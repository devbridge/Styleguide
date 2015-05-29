var categoryService = (function ($) {
  var module = {};
  var cachedCategories;

  module.getCategories = function (callback) {
    if ( !cachedCategories ) {
      console.log('ne is keso');
      $.getJSON('../../../config.txt', function (data) {
        cachedCategories = data.categories;
        callback(cachedCategories);
      });
    } else {
      console.log('is keso');
      callback(cachedCategories);
    }
  };

  return module;
})(jQuery || {});