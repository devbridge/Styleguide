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
  var module = {};

  module.getByCategoryId = function ( categoryId, callback ) {
    categoryService.getCategories(function (categories) {
      var index;
      for (index = 0, len = categories.length; index < len; index++) {
        if ( categories[index].id == categoryId ) {
          break;
        }
      }

      var path = '../../../styleguide_db/' + categories[index].name + '.txt';

      $.getJSON(path, function ( data ) {
        callback(data);
      });
    });
  };

  module.getById = function ( snippetId ) {

  };

  module.postNew = function ( snippet ) {

  };

  module.putEdited = function ( snippet ) {

  };


  return module;
})(jQuery || {}, categoryService);