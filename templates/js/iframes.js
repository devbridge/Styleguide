var iframesService = (function ($, snippetService){
  var module = {},
      cachedConfig;

  var getConfig = function ( callback ) {
    if (!cachedConfig) {
      $.getJSON('../../../config.txt', function (data) {
        cachedConfig = data;
        callback(cachedConfig);
      });
    } else {
      callback(cachedConfig);
    }
  };

  var getDefaultTemplate = function () {
    return  '<head lang="en">' + 
            ' <meta charset="UTF-8">' +
            ' <title>Snippet Iframe</title>' +
            ' <style type="text/css">' +
            '   body, html{margin: 0; height: 100%}' +
            '   body > div{ height: 100%}' +
            ' </style>' +
            '</head>' +
            '<body>' +
            ' <div id="snippet"></div>' +
            '</body>';
  };

  var constructFrames = function ( snippets, callback ) {
    var index,
        framesArray = [],
        tempFrame;
        len = snippets.length;

    for (index = 0; len > index; index++) {
      tempFrame = $('<iframe></iframe>');
      tempFrame.attr('sandbox', 'allow-same-origin allow-scripts');
      tempFrame.attr('id', 'snippet-' + snippets[index].id);
      framesArray.push(tempFrame);
    }
    callback(framesArray);
  };

  module.constructFrame = function ( snippet, callback ) {
    var tempFrame = $('<iframe></iframe>');

    tempFrame.attr('sandbox', 'allow-same-origin allow-scripts');
    tempFrame.attr('id', 'snippet-' + snippet.id);

    callback(tempFrame);
  };

  module.getTemplate = function ( callback ) {
    getConfig(function ( config ) {     
      if (!config.snippetTemplate) {
        callback(getDefaultTemplate());
      } else {
        $.get('../../../' + config.snippetTemplate, function ( data ) {
          callback(data);
        });
      }
    });
  };

  module.formFramesForCategory = function ( categoryId, callback ) {
    snippetService.getByCategoryId(categoryId, function ( snippets ) {
      constructFrames(snippets, function ( frames ) {
        callback(frames, snippets);
      });
    });
  };

  module.formFramesForDeleted = function ( callback ) {
    snippetService.getDeletedSnippets(function ( snippets ) {
      constructFrames(snippets, function ( frames ) {
        callback(frames, snippets);
      });
    });
  };

  return module;
})(jQuery || {}, snippetService);