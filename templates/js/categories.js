var categoryService = (function ($) {
  var module = {};
  var cachedCategories;

  var fetchCategories = function (callback) {
    $.getJSON('../../../config.txt', function (data) {
      cachedCategories = data.categories;
    });
  };

  module.getCategories = function () {
    if ( !cachedCategories ) {
      console.log('ne is keso');
      $.getJSON('../../../config.txt', function (data) {
        cachedCategories = data.categories;
      });
    }
    
    return cachedCategories;
    
  };
/*
  module.getCategories = function () {
    if (!cachedCategories) {
      console.log('ne is keso');
      fetchCategories();
    } else {
      return cachedCategories;
    }
  };
*/
  return module;
})(jQuery || {});