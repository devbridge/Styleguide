var snippetActions = (function ($, snippetService, iframesService, editorService, viewService) {
  var module = {};

  module.createSnippet = function ( e ) {
    var form = $(this),
        fields = form.find('.js-form-submit-field'),
        currentField,
        len = fields.length,
        data = {},
        index;

    e.preventDefault();

    for (index = 0; len > index; index++) {
      currentField = $(fields[index]);
      data[currentField.data('js-field-name')] = currentField.val();
    }

    data.code = ace.edit('jsNewCode').getValue();
    data.inlineCss = ace.edit('jsNewCss').getValue();

    snippetService.postNew(data, function ( snippet ) {
      if ( typeof snippet === 'object' && snippet.category == viewService.getCurrentView().id ) {
        iframesService.constructFrame(snippet, function ( frame ) {
          var currentSnippetElement = $($('#snippet').html()).clone(true),
              formFields,
              snippetId,
              snippetContents;

          iframesService.getTemplate(function ( template ) {
            currentId = snippet.id;
            formFields = currentSnippetElement.find('.js-edit-snippet').find('.js-form-submit-field');
            currentSnippetElement.attr('id', currentId);
            snippetId = frame.attr('id');

            currentSnippetElement.find('.js-snippet-name').html(snippet.name);
            currentSnippetElement.find('.js-snippet-description').html(snippet.description);
            currentSnippetElement.find('.js-edit-code').text(snippet.code);
            currentSnippetElement.find('.js-edit-css').text(snippet.inlineCss);
            currentSnippetElement.find('.js-snippet-code-preview').text(snippet.code);
            currentSnippetElement.find('.js-snippet-source').html(frame);
            currentSnippetElement.addClass(snippetId);

            currentSnippetElement.find('.js-delete-snippet').attr('data-id', currentId).on('click', function () {
              var idToDelete = $(this).data('id');
              snippetService.deleteById(idToDelete, function ( data ) {
                if ( typeof data === 'object' && data.isDeleted ) {
                  $('#' + data.id).detach();
                } else {
                  console.log(data);
                }
              });
            });

            categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

            for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
              currentField = $(formFields[fieldIndex]);
              currentField.val(snippet[currentField.data('js-field-name')]);
            }

            currentSnippetElement.sgSnippet();

            currentSnippetElement.appendTo('.main');

            snippetContents = $('#' + snippetId).contents();

            snippetContents.find('html').html(template);
            snippetContents.find('#snippet').html(snippet.code);

            currentSnippetElement.find('.js-edit-snippet').submit(snippetActions.editSnippet);
          });
        });
      } else if ( typeof snippet === 'string' ) {
        console.log(snippet);
      }
    });
  };

  module.editSnippet = function ( e ) {
    var form = $(this),
        fields = form.find('.js-form-submit-field'),
        snippetId = form.closest('.js-snippet').attr('id'),
        currentField,
        len = fields.length,
        data = {},
        index,
        code,
        css;

    e.preventDefault();

    for (index = 0; len > index; index++) {
      currentField = $(fields[index]);
      data[currentField.data('js-field-name')] = currentField.val();
    }

    code = ace.edit('snippet-' + snippetId + '-code').getValue();
    css = ace.edit('snippet-' + snippetId + '-css').getValue();

    data.code = code;
    data.inlineCss = css;

    snippetService.putEdited(data, snippetId, function ( snippet ) {
      if ( typeof snippet === 'object' ) {
        var snippetContainer = form.closest('.js-snippet'),
            snippetContents;

        if ( snippet.category != viewService.getCurrentView().id ) {
          snippetContainer.remove();
          return;
        }

        snippetContainer.find('.js-snippet-name').html(snippet.name);
        snippetContainer.find('.js-snippet-description').html(snippet.description);
        snippetContainer.find('.js-snippet-code-preview').text(snippet.code);

        snippetContents = snippetContainer.find('iframe').contents();
        snippetContents.find('#snippet').html(snippet.code);
      } else {
        console.log(snippet);
      }
    });
  };

  module.drawSnippets = function ( frames, snippets ) {
    var snippetId,
        snippetContents,
        snippetContainer,
        currentSnippetElement,
        currentId,
        index,
        len = frames.length,
        formFields,
        fieldIndex,
        fieldLen,
        currentField;

    snippetContainer = $($('#snippet').html());
    iframesService.getTemplate(function ( template ) {
      for (index = 0; len > index; index++) {
        currentId = snippets[index].id;
        currentSnippetElement = snippetContainer.clone(true);
        formFields = currentSnippetElement.find('.js-edit-snippet').find('.js-form-submit-field');
        currentSnippetElement.attr('id', currentId);
        snippetId = frames[index].attr('id');

        currentSnippetElement.find('.js-snippet-name').html(snippets[index].name);
        currentSnippetElement.find('.js-snippet-description').html(snippets[index].description);
        currentSnippetElement.find('.js-edit-code').text(snippets[index].code);
        currentSnippetElement.find('.js-edit-css').text(snippets[index].inlineCss);
        currentSnippetElement.find('.js-snippet-code-preview').text(snippets[index].code);
        currentSnippetElement.find('.js-snippet-source').html(frames[index]);
        currentSnippetElement.addClass(snippetId);

        currentSnippetElement.find('.js-delete-snippet').attr('data-id', currentId).on('click', function () {
          var idToDelete = $(this).data('id');
          snippetService.deleteById(idToDelete, function ( data ) {
            if ( typeof data === 'object' && data.isDeleted ) {
              console.log($('#' + data.id).detach());
            } 
            console.log(data);
          });
        });

        categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

        for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
          currentField = $(formFields[fieldIndex]);
          currentField.val(snippets[index][currentField.data('js-field-name')]);
        }

        currentSnippetElement.sgSnippet();

        currentSnippetElement.appendTo('.main');

        snippetContents = $('#' + snippetId).contents();

        snippetContents.find('html').html(template);
        snippetContents.find('#snippet').html(snippets[index].code);

        currentSnippetElement.find('.js-edit-snippet').submit(snippetActions.editSnippet);
      }
    });
  };

  return module;
})(jQuery || {}, snippetService, iframesService, editorService, viewService);