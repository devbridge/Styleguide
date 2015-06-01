$(function () {
  loadSnippets();
});

var loadSnippets = function () {
  var snippets = [], index;

  $.getJSON('../styleguide_db/general.txt', function (data) {
    for (index = 0, len = data.length; index < len; index++) {
      if ( !data[index].isDeleted ) {
        snippets.push(data[index]);
      }
    }
    injectFrames(snippets);
  });
};

var injectFrames = function ( snippets ) {
  var index;

  for (index = 0, len = snippets.length; index < len; index++) {
    var $frame = $('<iframe></iframe>');

    $frame.attr('id', 'snippet-' + snippets[index].id);
    $frame.attr('sandbox', 'allow-same-origin allow-scripts');
    $.when($frame.appendTo('.main')).then(function(){

      $.get('../template.html', function ( data ) {
        console.log('entered');
        for (var ind = 0, len = snippets.length; ind < len; ind++) {
          var snippetFrame = $('#snippet-' + snippets[ind].id).contents();

          snippetFrame.find('html').html(data);
          snippetFrame.find('#snippet').html(snippets[ind].code);
        }
      });
    });

  }
};


var snippetService = (function ($, categoryService) {
  var module = {},
      path = '//' + window.location.hostname + ':3000/snippets/';

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
            desireableSnippet.category = index;
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
      console.log('Failed to create new snippet! Maybe your styleguide server is down?');
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
      console.log('Failed to edit snippet! Maybe your styleguide server is down?');
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
      console.log('Failed to delete snippet! Maybe your styleguide server is down?');
      callback('Failed to delete snippet! Maybe your styleguide server is down?');
    });
  };


  return module;
})(jQuery || {}, categoryService);