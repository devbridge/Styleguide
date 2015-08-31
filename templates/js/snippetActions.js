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
    var idToDelete = $(this).data('id'),
      modalContent,
      modal;

    modalContent = '<p>Are you sure you want to delete this snippet?</p>';
    modalContent += '<button class="btn-primary btn-primary--white js-confirm-delete">Yes!</button>';
    modalContent += '<button class="btn-primary btn-primary--white" data-modal-control="close">No!</button>';

    modal = $.openModal({
      title: 'Snippet Deletion',
      width: 500,
      content: modalContent,
      onLoad: function() {
        $('.js-confirm-delete').on('click', function(e) {
          e.preventDefault();
          modal.close();
          snippetService.deleteById(idToDelete, function(data) {
            var content;
            if (typeof data === 'object' && data.isDeleted) {
              $('#' + data.id).detach();
              content = '<p>Snippet successfully deleted!</p>';
            } else {
              content = '<p>' + data + '</p>';
            }
            $.openModal({
              title: 'Snippet Deletion',
              width: 500,
              content: content
            });
          });
        });
      }
    });
  };

  module.appendIframeContent = function(frameId, template, content, css, includeJs) {
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

    if (includeJs) {
      rawJsFrame = document.getElementById(frameId.attr('id'));

      iframesService.getJavaScripts(function(jsResources) {
        length = jsResources.length;

        for (index = 0; index < length; index++) {
          injectJavaScript(rawJsFrame, jsResources[index]);
        }
      });
    }
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
      var modalContent;
      if (typeof snippet === 'object' && snippet.category === viewService.getCurrentView().id) {
        iframesService.constructFrame(snippet, function(frame) {
          var currentSnippetElement = $($('#snippet').html()).clone(true),
            formFields,
            snippetId,
            currentId,
            fieldIndex,
            fieldLen,
            currentField,
            iframeWindow,
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
            currentSnippetElement.find('.js-snippet-source').append('<div></div>');
            currentSnippetElement.find('.js-copy-code').attr('data-clipboard-text', snippet.code);
            currentSnippetElement.find('#form-new-include-js').prop('checked', snippet.includeJs);
            currentSnippetElement.addClass(snippetId);

            iframeWindow = currentSnippetElement.find('.js-snippet-preview').find('iframe').get(0);
            iframeWindow.style.width = viewService.getDefaultResolution();

            currentSnippetElement.find('.js-snippet-preview').css('width', viewService.getDefaultResolution());

            if (!snippet.isDeleted) {
              currentSnippetElement.find('.js-delete-snippet').attr('data-id', currentId).on('click', deleteHandler);
            } else {
              currentSnippetElement.find('.js-delete-snippet').addClass('hidden');
            }

            categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

            for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
              currentField = $(formFields[fieldIndex]);
              currentField.val(snippet[currentField.data('js-field-name')]);
            }

            currentSnippetElement.sgSnippet();

            currentSnippetElement.appendTo('.main');

            snippetContents = $('#' + snippetId);

            module.appendIframeContent(snippetContents, template, snippet.code, snippet.inlineCss, snippet.includeJs);
            snippetContents.load($.proxy(module.appendIframeContent, null, snippetContents, template, snippet.code, snippet.inlineCss, snippet.includeJs));

            currentSnippetElement.find('.js-edit-snippet').submit(snippetActions.editSnippet);

            new ZeroClipboard(currentSnippetElement.find('.js-copy-code').get());

            modalContent = '<p>Snippet Created successfully!</p>';
            clearOutForm(form);
            form.removeClass('preloading');
            $(".js-new-snippet-form").toggle();
          });
        });
      } else if (typeof snippet === 'string') {
        modalContent = '<p>' + snippet + '</p>';
        form.removeClass('preloading');
      } else if (typeof snippet === 'object') {
        modalContent = '<p>Snippet Created successfully!</p>';
        clearOutForm(form);
        form.removeClass('preloading');
        $(".js-new-snippet-form").toggle();
      }

      $.openModal({
        title: 'Snippet Creation',
        width: 500,
        content: modalContent
      });
    });
  };

  var submitUpdatedSnippet = function(data, snippetId, snippetContainer, form) {
    snippetService.putEdited(data, snippetId, function(snippet) {
      var modalContent;
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

        snippetContainer.addClass('edited-snippet');

        snippetContents = snippetContainer.find('iframe');

        module.appendIframeContent(snippetContents, null, snippet.code, snippet.inlineCss, snippet.includeJs);
        snippetContents.load($.proxy(module.appendIframeContent, null, snippetContents, null, snippet.code, snippet.inlineCss, snippet.includeJs));

        form.removeClass('preloading');
        snippetContents.addClass('updated');
        modalContent = '<p>Snippet updated successfully!</p>';
      } else {
        modalContent = '<p>' + snippet + '</p>';
        form.removeClass('preloading');
      }

      $.openModal({
        title: 'Update Snippet',
        width: 500,
        content: modalContent
      });
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
      index,
      modal;

    form.addClass('preloading');

    e.preventDefault();

    for (index = 0; len > index; index++) {
      currentField = $(fields[index]);
      data[currentField.data('js-field-name')] = currentField.val();
    }

    data.includeJs = form.find('#form-new-include-js').is(':checked');

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
      errorText = '<p>Your HTML or CSS syntax contains errors!</p><p>Are you sure you to submit your snippet?</p>';
      errorText += '<button class="btn-primary btn-primary--white js-confirm-create">Yes!</button>';
      errorText += '<button class="btn-primary btn-primary--white" data-modal-control="close">No!</button>';

      modal = $.openModal({
        title: 'Snippet Creation',
        width: 500,
        content: errorText,
        onLoad: function() {
          $('.js-confirm-create').on('click', function(e) {
            e.preventDefault();
            modal.close();

            data.code = code.getValue();
            data.inlineCss = css.getValue();
            submitSnippet(data, form);
          });
        }
      });
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

    data.includeJs = form.find('#form-new-include-js').is(':checked');

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
      iframeWindow,
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
        currentSnippetElement.find('.js-snippet-source').append('<div></div>');
        currentSnippetElement.find('.js-snippet-size').text(resolution);
        currentSnippetElement.find('.js-copy-code').attr('data-clipboard-text', currentCode);
        currentSnippetElement.find('#form-new-include-js').prop('checked', snippets[index].includeJs);
        currentSnippetElement.addClass(snippetId);

        iframeWindow = currentSnippetElement.find('.js-snippet-preview').find('iframe').get(0);
        iframeWindow.style.width = resolution;

        currentSnippetElement.find('.js-snippet-preview').css('width', resolution);

        if (snippets[index].isEdited) {
          currentSnippetElement.addClass('edited-snippet');
        }

        if (!snippets[index].isDeleted) {
          currentSnippetElement.find('.js-delete-snippet').attr('data-id', currentId).on('click', deleteHandler);
        } else {
          currentSnippetElement.find('.js-delete-snippet').addClass('hidden');
        }

        categoryService.bindCategoriesToForm(currentSnippetElement.find('.js-form-select'));

        for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
          currentField = $(formFields[fieldIndex]);
          currentField.val(snippets[index][currentField.data('js-field-name')]);
        }

        currentSnippetElement.sgSnippet();

        currentSnippetElement.appendTo('.main');

        snippetIframe = $('#' + snippetId);

        module.appendIframeContent(snippetIframe, template, currentCode, snippets[index].inlineCss, snippets[index].includeJs);
        snippetIframe.load($.proxy(module.appendIframeContent, null, snippetIframe, template, currentCode, snippets[index].inlineCss, snippets[index].includeJs));

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
      content,
      index,
      len,
      request = $.ajax({
        method: 'GET',
        url: scrapeUrl,
        data: {},
        dataType: 'json'
      });

    request.done(function(data) {
      if (whatToScrape === 'snippets') {
        content = '<p>Count of found snippets: ' + data.totalFound + '</p>' + '<p>Count of new snippets: ' + data.foundNew + '</p>';

        if (data.duplicateIds.length) {
          content += '<p>Duplicate IDs in your code: ' + data.duplicateIds.toString() + '</p>' + '<p><span class="error">There are duplicate IDs in your code, this can cause unexpected behaviour of Styleguide!</span></p>';
        } else {
          content += '<p>Duplicate IDs in your code: None.</p>';
        }

        if (data.changedSnippets.length) {
          content += '<p>IDs of snippets that were changed: ' + data.changedSnippets.toString() + '</p>';
        } else {
          content += '<p>IDs of snippets that were changed: None.</p>';
        }
      } else {
        len = data.length;

        for (index = 0; len > index; index++) {
          content = '<p>Report for theme: ' + data[index].themeName + '</p>';
          content += '<p>Count of unique color values: ' + data[index].uniqueColVals + '</p>';

          if (data[index].diffOfColVals > 0) {
            content += '<p>' + data[index].diffOfColVals + ' color values were added.</p>';
          } else if (data[index].diffOfColVals < 0) {
            content += '<p>' + Math.abs(data[index].diffOfColVals) + ' color values were removed.</p>';
          } else if (data[index].diffOfColVals == 0) {
            content += '<p>Count of color values is the same as it was before.</p>';
          }

          if (data[index].hasOwnProperty('oldTypo')) {
            content += '<p>Typography has changed!</p>';
            content += '<div class="typo-summary-old"><h5>Old Typography:</h5><pre>' + JSON.stringify(data[index].oldTypo, null, 2) + '</pre></div>';
            content += '<div class="typo-summary-new"><h5>New Typography:</h5><pre>' + JSON.stringify(data[index].newTypo, null, 2) + '</pre></div>';
          } else {
            content += '<p>Typography hasn\'t changed!</p>';
          }
          content += '<br>';
        }
      }

      $.openModal({
        title: 'Scrape Report',
        width: 500,
        content: content,
        onClose: function() {
          window.location.reload(true);
        }
      });
    });

    request.fail(function() {
      $.openModal({
        title: 'Scrape Report',
        width: 500,
        content: '<p>Failed to scrape ' + whatToScrape + '! Maybe your styleguide server is down?</p>'
      });
    });
  };

  return module;
})(jQuery || {}, snippetService, iframesService, editorService, viewService);