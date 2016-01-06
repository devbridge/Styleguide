var snippetActions = (function ($, snippetService, iframesService, editorService, viewService) {
    var module = {};

    var injectJavaScript = function (iframe, source) {
        var scriptTag = iframe.contentWindow.document.createElement('script');

        scriptTag.type = 'text/javascript';
        scriptTag.src = source;
        scriptTag.async = false;

        iframe
            .contentWindow
            .document
            .body
            .appendChild(scriptTag);
    };

    var deleteHandler = function () {
        var idToDelete = $(this).data('id'),
            modalContent,
            modal;

        modalContent = '' +
            '<p>Are you sure you want to delete this snippet?</p>' +
            '<div class="btn-holder">' +
                '<button class="btn-primary js-confirm-delete">Yes</button>' +
                '<button class="btn-blank" data-modal-control="close">No</button>' +
            '</div>';

        modal = $.openModal({
            title: 'Snippet Deletion',
            width: 500,
            content: modalContent,
            onLoad: function () {
                $('.js-confirm-delete').on('click', function (e) {
                    e.preventDefault();
                    modal.close();
                    snippetService.deleteById(idToDelete, function (data) {
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

    module.appendIframeContent = function (frameId, template, content, css, includeJs) {
        var frame = $(frameId).contents(),
            rawJsFrame,
            frameHTML,
            index,
            length;

        if (template) {
            frameHTML = frame.find('html').get(0);
            frameHTML.innerHTML = template;
        }

        frame
            .find('style') //TODO fix: it should not remove template style
            .empty()
            .append(css)
            .end()
            .find('#snippet')
            .html(content)
            .end()
            .find('script')
            .remove();

        if (includeJs === true || includeJs === "true") {
            rawJsFrame = document.getElementById(frameId.attr('id'));

            iframesService.getJavaScripts(function (jsResources) {
                length = jsResources.length;

                for (index = 0; index < length; index++) {
                    injectJavaScript(rawJsFrame, jsResources[index]);
                }
            });
        }
    };

    var clearOutForm = function (form) {
        var fields = form.find('.js-form-submit-field'),
            len = fields.length,
            index;

        for (index = 0; len > index; index++) {
            $(fields[index]).val('');
        }

        ace
            .edit('jsNewCss')
            .setValue('#snippet { \n  \n}');
        ace
            .edit('jsNewCode')
            .setValue('');
    };

    var drawSnippet = function (template, snippet, frame) {
        var snippetId = frame.attr('id'),
            snippetContents,
            currentSnippetElement = $($('#snippet').html()).clone(true),

            //array iterators
            currentField,
            fieldIndex,
            fieldLen,

            //text
            snippetName = currentSnippetElement.find('.js-snippet-name'),
            snippetDescription =  currentSnippetElement.find('.js-snippet-description'), //inside code view

            //form
            snippetEdit = currentSnippetElement.find('.js-edit-snippet'), //panel
            snippetEditCode =  currentSnippetElement.find('.js-edit-code'),
            snippetEditCss =  currentSnippetElement.find('.js-edit-css'),
            snippetIncludeJs = currentSnippetElement.find('.form-include-js'),
            snippetDelete = currentSnippetElement.find('.js-delete-snippet'),
            snippetCategorySelect = currentSnippetElement.find('.js-form-select'),

            //copy
            snippetCopyCode = currentSnippetElement.find('.js-copy-code'),
            snippetCodePreview = currentSnippetElement.find('.js-snippet-code-preview'),

            //view
            snippetSource = currentSnippetElement.find('.js-snippet-source'),
            snippetPreview = currentSnippetElement.find('.js-snippet-preview'),

            //snippet viewport text
            snippetSize = currentSnippetElement.find('.js-snippet-size'),

            //resizing functionality
            snippetResizeLength = currentSnippetElement.find(".js-resize-length"),

            includeJs = snippet.includeJs,
            formFields = snippetEdit.find('.js-form-submit-field'),
            resolution = viewService.getDefaultResolution(),
            iframeWindow;

        currentSnippetElement.attr('id', snippet.id);

        if(includeJs === "true" || includeJs === true) {
            includeJs = true;
        } else if (includeJs === "false" || includeJs === false) {
            includeJs = false;
        }

        //text
        snippetName.html(snippet.name);
        snippetDescription.html(snippet.description);

        //form
        snippetEditCode.text(snippet.code);
        snippetEditCss.text(snippet.inlineCss);
        snippetIncludeJs.prop('checked', includeJs);
        categoryService.bindCategoriesToForm(snippetCategorySelect);
        snippetEdit.submit({isNew: false}, snippetActions.createEditSnippet);

        if (!snippet.isDeleted) {
            snippetDelete
                .attr('data-id', snippet.id)
                .on('click', deleteHandler);
        } else {
            snippetDelete.addClass('hidden');
        }

        //copy
        snippetCopyCode.attr('data-clipboard-text', snippet.code);
        snippetCodePreview.text(snippet.code);

        //view
        snippetSource
            .html(frame)
            .append('<div></div>');

        //viewport size
        snippetSize.text(resolution + "px");
        snippetResizeLength.css("width", parseInt(resolution / 2, 10));

        currentSnippetElement.addClass(snippetId);

        iframeWindow = snippetPreview.find('iframe').get(0);
        iframeWindow.style.width = resolution;
        snippetPreview.css('width', resolution);

        //TODO used?
        if (snippet.isEdited) {
            currentSnippetElement.addClass('edited-snippet');
        }

        for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
            currentField = $(formFields[fieldIndex]);
            currentField.val(snippet[currentField.data('js-field-name')]);
        }

        currentSnippetElement.sgSnippet();
        currentSnippetElement.appendTo('.main');
        snippetContents = $('#' + snippetId);

        module.appendIframeContent(snippetContents, template, snippet.code, snippet.inlineCss, includeJs);
        snippetContents.load($.proxy(module.appendIframeContent, null, snippetContents, template, snippet.code, snippet.inlineCss, includeJs));

        //init copy button
        new ZeroClipboard(currentSnippetElement.find('.js-copy-code').get());
    };

    var submitSnippet = function (data, form) {
        snippetService.postNew(data, function (snippet) {
            var modalContent;
            if (typeof snippet === 'string') {
                //error
                modalContent = '<p>' + snippet + '</p>';
            } else if (typeof snippet === 'object') {
                //snippet creation in current category
                if(snippet.category === viewService.getCurrentView().id) {
                    iframesService.constructFrame(snippet, function (frame) {
                        iframesService.getTemplate(function (template) {
                            drawSnippet(template, snippet, frame);
                        });
                    });
                }

                modalContent = '<p>Snippet Created successfully!</p>';
                clearOutForm(form);
                $(".js-new-snippet-form").toggle();
            }

            form.removeClass('preloading');
            $.openModal({
                title: 'Snippet Creation',
                width: 500,
                content: modalContent
            });
        });
    };

    var submitUpdatedSnippet = function (data, snippetId, snippetContainer, form) {
        snippetService.putEdited(data, snippetId, function (snippet) {
            var modalContent;

            if (typeof snippet === 'object') {
                //edit update
                var snippetContents,
                    includeJs = snippet.includeJs;

                //if id changed
                if (snippet.category !== viewService.getCurrentView().id) {
                    snippetContainer.remove();
                    return;
                }

                if(includeJs === "true" || includeJs === true) {
                    includeJs = true;
                } else if (includeJs === "false" || includeJs === false) {
                    includeJs = false;
                }

                snippetContainer
                    .find('.js-snippet-name')
                    .html(snippet.name);
                snippetContainer
                    .find('.js-snippet-description')
                    .html(snippet.description);
                snippetContainer
                    .find('.js-snippet-code-preview')
                    .text(snippet.code);
                snippetContainer
                    .find('.js-copy-code')
                    .attr('data-clipboard-text', snippet.code);

                snippetContainer.addClass('edited-snippet');

                snippetContents = snippetContainer.find('iframe');

                module.appendIframeContent(snippetContents, null, snippet.code, snippet.inlineCss, includeJs);
                snippetContents.load($.proxy(module.appendIframeContent, null, snippetContents, null, snippet.code, snippet.inlineCss, includeJs));

                snippetContents.addClass('updated');
                modalContent = '<p>Snippet updated successfully!</p>';
            } else {
                //edit error
                modalContent = '<p>' + snippet + '</p>';
            }

            form.removeClass('preloading');
            $.openModal({
                title: 'Update Snippet',
                width: 500,
                content: modalContent
            });
        });
    };

    module.createEditSnippet = function(e) {
        e.preventDefault();

        var isNew = e.data.isNew,
            form = $(this),
            data = {},

            //fields
            fields = form.find('.js-form-submit-field'),
            currentField,

            //errors
            annotations,
            errors = [],
            errorText,

            //arrays
            len = fields.length,
            index,

            //editors
            snippetId,
            code,
            css,

            //modal
            modal,
            modalTitle;

        form.addClass('preloading');

        if (isNew) {
            modalTitle = 'Snippet Creation';
            code = ace.edit('jsNewCode');
            css = ace.edit('jsNewCss');
        } else {
            modalTitle = 'Snippet Update';
            snippetId = form.closest('.js-snippet').attr('id');
            code = ace.edit('snippet-' + snippetId + '-code');
            css = ace.edit('snippet-' + snippetId + '-css');
        }

        for (index = 0; len > index; index++) {
            currentField = $(fields[index]);
            data[currentField.data('js-field-name')] = currentField.val();
        }

        data.includeJs = form.find('.form-include-js').is(':checked');

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

        function submitFunction () {
            data.code = code.getValue();
            data.inlineCss = css.getValue();
            if (isNew) {
                submitSnippet(data, form);
            } else {
                submitUpdatedSnippet(data, snippetId, form.closest('.js-snippet'), form);
            }
        }

        if (errors.length > 0) {
            errorText = '' +
                '<p>Your HTML or CSS syntax contains errors!</p>' +
                '<p>Are you sure you to submit your snippet?</p>' +
                '<div class="btn-holder">' +
                    '<button class="btn-primary js-confirm-create">Yes</button>' +
                    '<button class="btn-blank" data-modal-control="close">No</button>' +
                '</div>';

            modal = $.openModal({
                title: modalTitle,
                width: 500,
                content: errorText,
                onLoad: function () {
                    $('.js-confirm-create').on('click', function (e) {
                        e.preventDefault();
                        modal.close();
                        submitFunction();
                    });
                }
            });
        } else {
            submitFunction();
        }
    };

    module.drawSnippets = function (frames, snippets) {
        var index,
            len = frames.length;
        iframesService.getTemplate(function (template) {
            for (index = 0; len > index; index++) {
                drawSnippet(template, snippets[index], frames[index]);
            }
            //TODO: redo that the content would be appended with iframe, so that timeout could be removed
            setTimeout($.proxy(module.handleHeights, null, $('iframe')), 1000);
        });
    };

    module.drawStaticSnippets = function (frames, snippets, snippetsContents) {
        var index,
            len = snippets.length,
            tempCode,
            snippetFrame;

        iframesService.getTemplate(function (template) {
            for (index = 0; len > index; index++) {
                //save source code
                tempCode = $(snippets[index].content).clone();

                //create frame
                $(snippetsContents[index])
                    .html(frames[index])
                    .append('<div></div>');

                //select frame
                snippetFrame = $('#snippet-' + snippets[index].id);

                //iframe magic
                module.appendIframeContent(snippetFrame, template, tempCode, '', false);
                snippetFrame.load($.proxy(module.appendIframeContent, null, snippetFrame, template, tempCode, '', false));

                //some static parts are smaller than 320px in width
                snippetFrame
                    .contents()
                    .find("body")
                    .css("min-width", 0);
            }
            //TODO: redo that the content would be appended with iframe, so that timeout could be removed
            setTimeout($.proxy(module.handleHeights, null, $('iframe')), 1000);
        });
    };

    module.handleHeights = function (iframes) {
        var len = iframes.length,
            index,
            snippet,
            overflow,
            height;

        for (index = 0; index < len; index++) {
            snippet = $(iframes[index]).contents().find("#snippet");
            overflow = snippet.css("overflow");
            snippet.css("overflow", "scroll");
            height = snippet.outerHeight();
            snippet.css("overflow", overflow);

            $(iframes[index]).height(height);
        }
    };

    module.scrapeHandler = function (whatToScrape) {
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

        request.done(function (data) {
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
                onClose: function () {
                    window
                        .location
                        .reload(true);
                }
            });
        });

        request.fail(function () {
            $.openModal({
                title: 'Scrape Report',
                width: 500,
                content: '<p>Failed to scrape ' + whatToScrape + '! Maybe your styleguide server is down?</p>'
            });
        });
    };

    return module;
})(jQuery || {}, snippetService, iframesService, editorService, viewService);