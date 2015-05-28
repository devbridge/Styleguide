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
        var ind = index;
    console.log(ind);
    $frame.attr('sandbox', 'allow-same-origin allow-scripts');
    $.when($frame.appendTo('.main')).then(function(){

      $.get('../template.html', function ( data ) {
        for (var ind = 0, len = snippets.length; ind < len; ind++) {
          $('#snippet-' + snippets[ind].id).contents().find('html').html(data.match(/(?=<head)[\d\D]*?(?=<\/html)/)[0]);
          $('#snippet-' + snippets[ind].id).contents().find('#snippet').html(snippets[ind].code);
        }
      });
    });

  }
};