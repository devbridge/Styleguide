var snippetActions = (function ($, snippetService, iframesService, editorService, viewService) {
  var module = {};

  var injectJavaScript = function ( iframe, source ) {
    var scriptTag = iframe.contentWindow.document.createElement('script');

    scriptTag.type = 'text/javascript';
    scriptTag.src = source;
    scriptTag.async = false;
      
    iframe.contentWindow.document.body.appendChild(scriptTag);
  };

  var appendIframeContent = function ( frameId, template, content, css ) {
    var frame = $(frameId).contents(),
        rawJsFrame,
        frameHTML,
        index,
        length;

    if ( template ) {
      frameHTML = frame.find('html').get(0);
      frameHTML.innerHTML = template;
    }
    
    frame.find('style').empty();
    frame.find('style').append(css);
    frame.find('#snippet').html(content);

    rawJsFrame = document.getElementById(frameId.attr('id'));

    iframesService.getJavaScripts(function ( jsResources ) {
      length = jsResources.length;

      for (index = 0; index < length; index++) {
        injectJavaScript(rawJsFrame, jsResources[index]);
      }
    });
  };

  var submitSnippet = function ( data ) {
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
              if ( window.confirm('Are you sure you want to delete this snippet?') ) {
                snippetService.deleteById(idToDelete, function ( data ) {
                  if ( typeof data === 'object' && data.isDeleted ) {
                    $('#' + data.id).detach();
                  } else {
                    console.log(data);
                  }
                });
              }
            });

            categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

            for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
              currentField = $(formFields[fieldIndex]);
              currentField.val(snippet[currentField.data('js-field-name')]);
            }

            currentSnippetElement.sgSnippet();

            currentSnippetElement.appendTo('.main');

            snippetContents = $('#' + snippetId);

            appendIframeContent(snippetContents, template, snippet.code, snippet.inlineCss);
            snippetContents.load($.proxy(appendIframeContent, null, snippetContents, template, snippet.code, snippet.inlineCss));

            currentSnippetElement.find('.js-edit-snippet').submit(snippetActions.editSnippet);
          });
        });
      } else if ( typeof snippet === 'string' ) {
        console.log(snippet);
      }
    });
  };

  var submitUpdatedSnippet = function ( data, snippetId, snippetContainer ) {
    snippetService.putEdited(data, snippetId, function ( snippet ) {
      if ( typeof snippet === 'object' ) {
        var snippetContents;

        if ( snippet.category != viewService.getCurrentView().id ) {
          snippetContainer.remove();
          return;
        }

        snippetContainer.find('.js-snippet-name').html(snippet.name);
        snippetContainer.find('.js-snippet-description').html(snippet.description);
        snippetContainer.find('.js-snippet-code-preview').text(snippet.code);

        snippetContents = snippetContainer.find('iframe');

        appendIframeContent(snippetContents, null, snippet.code, snippet.inlineCss);
        snippetContents.load($.proxy(appendIframeContent, null, snippetContents, null, snippet.code, snippet.inlineCss));
      } else {
        console.log(snippet);
      }
    });
  };

  module.createSnippet = function ( e ) {
    var form = $(this),
        fields = form.find('.js-form-submit-field'),
        currentField,
        code,
        css,
        annotations,
        errorText,
        errors = [],
        len = fields.length,
        data = {},
        index;

    e.preventDefault();

    for (index = 0; len > index; index++) {
      currentField = $(fields[index]);
      data[currentField.data('js-field-name')] = currentField.val();
    }

    code = ace.edit('jsNewCode');
    css = ace.edit('jsNewCss');

    annotations = code.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if ( annotations[index].type === 'error' ) {
        errors.push(annotations[index]);
      }
    }

    annotations = css.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if ( annotations[index].type === 'error' ) {
        errors.push(annotations[index]);
      }
    }

    if ( errors.length > 0 ) {
      errorText = 'Your HTML or CSS syntax contains errors!\n'
                  +'Are you sure you to submit your snippet?';
        if (window.confirm(errorText)) {
          data.code = code.getValue();
          data.inlineCss = css.getValue();
          submitSnippet(data);
        }
    } else {
      data.code = code.getValue();
      data.inlineCss = css.getValue();
      submitSnippet(data);
    }
  };

  module.editSnippet = function ( e ) {
    var form = $(this),
        fields = form.find('.js-form-submit-field'),
        snippetId = form.closest('.js-snippet').attr('id'),
        currentField,
        len = fields.length,
        data = {},
        annotations,
        errors = [],
        index,
        code,
        css;

    e.preventDefault();

    for (index = 0; len > index; index++) {
      currentField = $(fields[index]);
      data[currentField.data('js-field-name')] = currentField.val();
    }

    code = ace.edit('snippet-' + snippetId + '-code');
    css = ace.edit('snippet-' + snippetId + '-css');

    annotations = code.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if ( annotations[index].type === 'error' ) {
        errors.push(annotations[index]);
      }
    }

    annotations = css.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if ( annotations[index].type === 'error' ) {
        errors.push(annotations[index]);
      }
    }

    if ( errors.length > 0 ) {
      errorText = 'Your HTML or CSS syntax contains errors!\n'
                  +'Are you sure you to submit your snippet?';
        if (window.confirm(errorText)) {
          data.code = code.getValue();
          data.inlineCss = css.getValue();
          submitUpdatedSnippet(data, snippetId, form.closest('.js-snippet'));
        }
    } else {
      data.code = code.getValue();
      data.inlineCss = css.getValue();
      submitUpdatedSnippet(data, snippetId, form.closest('.js-snippet'));
    }
  };

  module.drawSnippets = function ( frames, snippets ) {
    var snippetId,
        snippetContainer,
        snippetIframe,
        currentSnippetElement,
        currentCode,
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
        currentCode = snippets[index].code;

        currentSnippetElement.find('.js-snippet-name').html(snippets[index].name);
        currentSnippetElement.find('.js-snippet-description').html(snippets[index].description);
        currentSnippetElement.find('.js-edit-code').text(currentCode);
        currentSnippetElement.find('.js-edit-css').text(snippets[index].inlineCss);
        currentSnippetElement.find('.js-snippet-code-preview').text(currentCode);
        currentSnippetElement.find('.js-snippet-source').html(frames[index]);
        currentSnippetElement.addClass(snippetId);

        currentSnippetElement.find('.js-delete-snippet').attr('data-id', currentId).on('click', function () {
          var idToDelete = $(this).data('id');
          if ( window.confirm('Are you sure you want to delete this snippet?') ) {
            snippetService.deleteById(idToDelete, function ( data ) {
              if ( typeof data === 'object' && data.isDeleted ) {
                $('#' + data.id).detach();
              } else {
                console.log(data);
              }
            });            
          }

        });

        categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

        for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
          currentField = $(formFields[fieldIndex]);
          currentField.val(snippets[index][currentField.data('js-field-name')]);
        }

        currentSnippetElement.sgSnippet();

        currentSnippetElement.appendTo('.main');

        snippetIframe = $('#' + snippetId);

        appendIframeContent(snippetIframe, template, currentCode, snippets[index].inlineCss);
        snippetIframe.load($.proxy(appendIframeContent, null, snippetIframe, template, currentCode, snippets[index].inlineCss));

        currentSnippetElement.find('.js-edit-snippet').submit(snippetActions.editSnippet);
      }
    });
  };

  module.scrapeHandler = function ( whatToScrape ) {
    var scrapeUrl = snippetService.getScrapePath(whatToScrape),
        request = $.ajax({
                    method: 'GET',
                    url: scrapeUrl,
                    data: {},
                    dataType: 'json'
                  });

    request.done(function ( data ) {
      alert('Scraped ' + whatToScrape + ': \n' + JSON.stringify(data, null, 2));
    });

    request.fail(function () {
      alert('Failed to scrape ' + whatToScrape + '! Maybe your styleguide server is down?');
    });
  };

  return module;
})(jQuery || {}, snippetService, iframesService, editorService, viewService);