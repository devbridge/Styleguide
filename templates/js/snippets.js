var snippetService = (function ($, categoryService) {
  var module = {},
      path = '//' + window.location.hostname + ':8080/snippets/';

  module.getDeletedSnippets = function ( callback ) {
    categoryService.getCategories(function ( categories ) {
      var len = categories.length,
          index,
          deletedSnippets = [],
          path;

      $.ajaxSetup({ async: false });

      for (index = 0; index < len; index++) {
        path = '../../../styleguide_db/' + categories[index].name + '.txt';

        $.getJSON(path, function ( data ) {
          var filteredSnippets = data.filter(function ( obj ) {
            return obj.isDeleted;
          });

          filteredSnippets = filteredSnippets.map(function ( obj ) {
            obj.category = categories[index].id;
            return obj;
          });

          deletedSnippets = deletedSnippets.concat(filteredSnippets);
        });
      }

      $.ajaxSetup({ async: true });

      callback(deletedSnippets);
    });
  };

  module.getByCategoryId = function ( categoryId, callback ) {
    categoryService.getCategories(function ( categories ) {
      var len = categories.length, 
          index, 
          path;

      for (index = 0; index < len; index++) {
        if ( categories[index].id == categoryId ) {
          break;
        }
      }

      path = '../../../styleguide_db/' + categories[index].name + '.txt';

      $.getJSON(path, function ( data ) {
        data = data.filter(function ( obj ) {
          return !obj.isDeleted;
        });

        data = data.map(function ( obj ) {
          obj.category = categoryId;
          return obj;
        });

        callback(data);
      });
    });
  };

  module.getById = function ( snippetId, callback ) {
    categoryService.getCategories(function ( categories ) {
      var len = categories.length,
          index,
          desireableSnippet,
          path;

      $.ajaxSetup({ async: false });

      for (index = 0; index < len; index++) {
        path = '../../../styleguide_db/' + categories[index].name + '.txt';

        $.getJSON(path, function ( data ) {
          desireableSnippet = data.filter(function (obj) {
            if (obj.id == snippetId) {
              return obj
            }
          })[0];

          if ( desireableSnippet ) {
            desireableSnippet.category = categories[index].id;
            callback(desireableSnippet);
          }

        });
      }

      $.ajaxSetup({ async: true });

      if ( !desireableSnippet ) {
        callback(desireableSnippet);
      }

    });
  };

  module.postNew = function ( snippet, callback ) {
    var request = $.ajax({
      method: 'POST',
      url: path,
      data: snippet,
      dataType: 'json'
    });

    request.done(function ( data ) {
      callback(data);
    });

    request.fail(function () {
      callback('Failed to create new snippet! Maybe your styleguide server is down?');
    });

  };

  module.putEdited = function ( snippet, id, callback ) {
    var request = $.ajax({
      method: 'PUT',
      url: path + id,
      data: snippet,
      dataType: 'json'
    });

    request.done(function ( data ) {
      callback(data);
    });

    request.fail(function () {
      callback('Failed to edit snippet! Maybe your styleguide server is down?');
    });
  };

  module.deleteById = function ( snippetId, callback ) {
    var request = $.ajax({
      method: 'DELETE',
      url: path + snippetId,
      data: {},
      dataType: 'json'
    });

    request.done(function ( data ) {
      callback(data);
    });

    request.fail(function () {
      callback('Failed to delete snippet! Maybe your styleguide server is down?');
    });
  };


  return module;
})(jQuery || {}, categoryService);