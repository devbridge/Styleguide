var snippetActions = (function($, snippetService, iframesService, editorService, viewService) {
  var module = {};

  var injectJavaScript = function(iframe, source) {
    var scriptTag = iframe.contentWindow.document.createElement('script');

    scriptTag.type = 'text/javascript';
    scriptTag.src = source;
    scriptTag.async = false;

    iframe.contentWindow.document.body.appendChild(scriptTag);
  };

  var deleteHandler = function() {
    var idToDelete = $(this).data('id');
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      snippetService.deleteById(idToDelete, function(data) {
        if (typeof data === 'object' && data.isDeleted) {
          $('#' + data.id).detach();
          alert('Snippet successfully deleted!');
        } else {
          alert(data);
        }
      });
    }
  };

  module.appendIframeContent = function(frameId, template, content, css) {
    var frame = $(frameId).contents(),
      rawJsFrame,
      frameHTML,
      index,
      length;

    if (template) {
      frameHTML = frame.find('html').get(0);
      frameHTML.innerHTML = template;
    }

    frame.find('style').empty();
    frame.find('style').append(css);
    frame.find('#snippet').html(content);
    frame.find('script').remove();

    rawJsFrame = document.getElementById(frameId.attr('id'));

    iframesService.getJavaScripts(function(jsResources) {
      length = jsResources.length;

      for (index = 0; index < length; index++) {
        injectJavaScript(rawJsFrame, jsResources[index]);
      }
    });
  };

  var clearOutForm = function(form) {
    var fields = form.find('.js-form-submit-field'),
      len = fields.length,
      index;

    for (index = 0; len > index; index++) {
      $(fields[index]).val('');
    }

    ace.edit('jsNewCss').setValue('#snippet { \n  \n}');
    ace.edit('jsNewCode').setValue('');
  };

  var submitSnippet = function(data, form) {
    snippetService.postNew(data, function(snippet) {
      if (typeof snippet === 'object' && snippet.category === viewService.getCurrentView().id) {
        iframesService.constructFrame(snippet, function(frame) {
          var currentSnippetElement = $($('#snippet').html()).clone(true),
            formFields,
            snippetId,
            currentId,
            fieldIndex,
            fieldLen,
            currentField,
            snippetContents;

          iframesService.getTemplate(function(template) {
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
            currentSnippetElement.find('.js-copy-code').attr('data-clipboard-text', snippet.code);
            currentSnippetElement.addClass(snippetId);

            currentSnippetElement.find('.js-delete-snippet').attr('data-id', currentId).on('click', deleteHandler);

            categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

            for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
              currentField = $(formFields[fieldIndex]);
              currentField.val(snippet[currentField.data('js-field-name')]);
            }

            currentSnippetElement.sgSnippet();

            currentSnippetElement.appendTo('.main');

            snippetContents = $('#' + snippetId);

            module.appendIframeContent(snippetContents, template, snippet.code, snippet.inlineCss);
            snippetContents.load($.proxy(module.appendIframeContent, null, snippetContents, template, snippet.code, snippet.inlineCss));

            currentSnippetElement.find('.js-edit-snippet').submit(snippetActions.editSnippet);

            new ZeroClipboard(currentSnippetElement.find('.js-copy-code').get());

            alert('Snippet Created successfully!');
            clearOutForm(form);
            form.removeClass('preloading');
            $(".js-new-snippet-form").toggle();
          });
        });
      } else if (typeof snippet === 'string') {
        alert(snippet);
        form.removeClass('preloading');
      } else if (typeof snippet === 'object') {
        alert('Snippet Created successfully!');
        clearOutForm(form);
        form.removeClass('preloading');
        $(".js-new-snippet-form").toggle();
      }
    });
  };

  var submitUpdatedSnippet = function(data, snippetId, snippetContainer, form) {
    snippetService.putEdited(data, snippetId, function(snippet) {
      if (typeof snippet === 'object') {
        var snippetContents;

        if (snippet.category !== viewService.getCurrentView().id) {
          snippetContainer.remove();
          return;
        }

        snippetContainer.find('.js-snippet-name').html(snippet.name);
        snippetContainer.find('.js-snippet-description').html(snippet.description);
        snippetContainer.find('.js-snippet-code-preview').text(snippet.code);
        snippetContainer.find('.js-copy-code').attr('data-clipboard-text', snippet.code);

        snippetContents = snippetContainer.find('iframe');

        module.appendIframeContent(snippetContents, null, snippet.code, snippet.inlineCss);
        snippetContents.load($.proxy(module.appendIframeContent, null, snippetContents, null, snippet.code, snippet.inlineCss));

        form.removeClass('preloading');
        snippetContents.addClass('updated');
        alert('Snippet updated successfully!');
      } else {
        alert(snippet);
        form.removeClass('preloading');
      }
    });
  };

  module.createSnippet = function(e) {
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

    form.addClass('preloading');

    e.preventDefault();

    for (index = 0; len > index; index++) {
      currentField = $(fields[index]);
      data[currentField.data('js-field-name')] = currentField.val();
    }

    code = ace.edit('jsNewCode');
    css = ace.edit('jsNewCss');

    annotations = code.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if (annotations[index].type === 'error') {
        errors.push(annotations[index]);
      }
    }

    annotations = css.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if (annotations[index].type === 'error') {
        errors.push(annotations[index]);
      }
    }

    if (errors.length > 0) {
      errorText = 'Your HTML or CSS syntax contains errors!\n' + 'Are you sure you to submit your snippet?';
      if (window.confirm(errorText)) {
        data.code = code.getValue();
        data.inlineCss = css.getValue();
        submitSnippet(data, form);
      }
    } else {
      data.code = code.getValue();
      data.inlineCss = css.getValue();
      submitSnippet(data, form);
    }
  };

  module.editSnippet = function(e) {
    var form = $(this),
      fields = form.find('.js-form-submit-field'),
      snippetId = form.closest('.js-snippet').attr('id'),
      currentField,
      len = fields.length,
      data = {},
      annotations,
      errors = [],
      index,
      errorText,
      code,
      css;

    form.addClass('preloading');

    e.preventDefault();

    for (index = 0; len > index; index++) {
      currentField = $(fields[index]);
      data[currentField.data('js-field-name')] = currentField.val();
    }

    code = ace.edit('snippet-' + snippetId + '-code');
    css = ace.edit('snippet-' + snippetId + '-css');

    annotations = code.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if (annotations[index].type === 'error') {
        errors.push(annotations[index]);
      }
    }

    annotations = css.getSession().getAnnotations();

    for (index = 0, len = annotations.length; index < len; index++) {
      if (annotations[index].type === 'error') {
        errors.push(annotations[index]);
      }
    }

    if (errors.length > 0) {
      errorText = 'Your HTML or CSS syntax contains errors!\n' + 'Are you sure you to submit your snippet?';
      if (window.confirm(errorText)) {
        data.code = code.getValue();
        data.inlineCss = css.getValue();
        submitUpdatedSnippet(data, snippetId, form.closest('.js-snippet'), form);
      }
    } else {
      data.code = code.getValue();
      data.inlineCss = css.getValue();
      submitUpdatedSnippet(data, snippetId, form.closest('.js-snippet'), form);
    }
  };

  module.drawSnippets = function(frames, snippets, resolution) {
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
    iframesService.getTemplate(function(template) {
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
        currentSnippetElement.find('.js-snippet-preview').css('width', resolution);
        currentSnippetElement.find('.js-snippet-size').val(resolution);
        currentSnippetElement.find('.js-copy-code').attr('data-clipboard-text', currentCode);
        currentSnippetElement.addClass(snippetId);

        currentSnippetElement.find('.js-delete-snippet').attr('data-id', currentId).on('click', deleteHandler);

        categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

        for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
          currentField = $(formFields[fieldIndex]);
          currentField.val(snippets[index][currentField.data('js-field-name')]);
        }

        currentSnippetElement.sgSnippet();

        currentSnippetElement.appendTo('.main');

        snippetIframe = $('#' + snippetId);

        module.appendIframeContent(snippetIframe, template, currentCode, snippets[index].inlineCss);
        snippetIframe.load($.proxy(module.appendIframeContent, null, snippetIframe, template, currentCode, snippets[index].inlineCss));

        currentSnippetElement.find('.js-edit-snippet').submit(snippetActions.editSnippet);
      }
      //TODO: redo that the content would be appended with iframe, so that timeout could be removed
      setTimeout($.proxy(module.handleHeights, null, $('iframe')), 1000);

      new ZeroClipboard($('.js-copy-code').get());
    });
  };

  module.handleHeights = function(iframes) {
    var len = iframes.length,
      index;

    for (index = 0; index < len; index++) {
      $(iframes[index]).height($(iframes[index]).contents().height());
    }
  };

  module.scrapeHandler = function(whatToScrape) {
    var scrapeUrl = snippetService.getScrapePath(whatToScrape),
      request = $.ajax({
        method: 'GET',
        url: scrapeUrl,
        data: {},
        dataType: 'json'
      });

    request.done(function(data) {
      alert('Scraped ' + whatToScrape + ': \n' + JSON.stringify(data, null, 2));
      window.location.reload(true);
    });

    request.fail(function() {
      alert('Failed to scrape ' + whatToScrape + '! Maybe your styleguide server is down?');
    });
  };

  return module;
})(jQuery || {}, snippetService, iframesService, editorService, viewService);