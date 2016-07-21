(function ($, window, document, editorService, snippetActions, iframesService) {
    function Plugin(element) {
        this.$element = $(element);
        this.events();
    }

    Plugin.prototype = {
        events: function () {
                //buttons
            var $btnSettings = this.$element.find(".js-snippet-settings-btn"),
                $btnCode = this.$element.find(".js-snippet-code-btn"),
                $btnCancel = this.$element.find(".js-btn-cancel"),
                //panels
                $settings = this.$element.find(".js-snippet-settings"),
                $code = this.$element.find(".js-snippet-code"),
                //inside settings
                $preview = this.$element.find(".js-snippet-preview"),
                $previewSource = $preview.find("iframe"),
                //viewport
                $handleLeft = this.$element.find(".js-snippet-resize-handle-left"),
                $handleRight = this.$element.find(".js-snippet-resize-handle-right"),
                $sizeIndicator = this.$element.find(".js-snippet-size"),
                $resizeLength = this.$element.find(".js-resize-length"),
                //data
                snippetSource = ".js-snippet-source",
                editors,
                originalValues = {},

                timer,
                snippetTemplate;

            //live preview functions
            function delay(callback, ms) {
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            }

            function onSourceChange() {
                delay(function(){
                    snippetActions.appendIframeContent($previewSource, snippetTemplate, editors.code.getValue(), editors.css.getValue());
                    if (!snippetActions.isIE) {
                        $previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, snippetTemplate, editors.code.getValue(), editors.css.getValue()));
                    }
                }, 500);
            }

            //module snippet's edit button and cancel button
            $btnSettings
                .add($btnCancel) //elements merge
                .on("click", function () {

                    // hide code
                    $btnCode
                        .removeClass("active")
                        .text("Show code")
                        .attr("data-toggle-text", "Hide code");
                    $code.removeClass("active");
                    // $('.js-snippet-settings').removeClass('active');
                    // $('.js-snippet-code-btn').removeClass('active');

                    // toggle settings
                    $btnSettings.toggleClass("active");
                    $settings.toggleClass("active");

                    iframesService.getTemplate(function (template) {
                        if ($btnSettings.hasClass("active")) {
                            editors = editorService.addToEditForm($code.parent());
                            originalValues.code = editors.code.getValue();
                            originalValues.css = editors.css.getValue();
                            snippetTemplate = template;
                            var $tabAction = $(".js-snippet-edit-action"),
                                $tabSource = $(".js-snippet-edit-src");

                            $tabAction.on('click', function () {
                                var self = $(this),
                                    id = self.attr('data-target');

                                if (id) {
                                    $tabAction.parent().removeClass('is-active');
                                    self.parent().addClass('is-active');

                                    $tabSource.removeClass('is-active');
                                    self.closest('.js-edit-snippet').find('#' + id).addClass('is-active');
                                }
                            });

                            editors
                                .code
                                .on('change', onSourceChange);
                            editors
                                .css
                                .on('change', onSourceChange);
                        } else {
                            editors
                                .code
                                .off('change', onSourceChange);
                            editors
                                .css
                                .off('change', onSourceChange);

                            if (!$previewSource.hasClass('updated')) {
                                snippetActions.appendIframeContent($previewSource, snippetTemplate, originalValues.code, originalValues.css);
                                if (!snippetActions.isIE) {
                                    $previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, snippetTemplate, editors.code.getValue(), editors.css.getValue()));
                                }

                                editors
                                    .code
                                    .setValue(originalValues.code);
                                editors
                                    .css
                                    .setValue(originalValues.css);
                            }

                            $previewSource.removeClass('updated');
                            editorService.removeFromEditForm($code.parent());
                        }
                    });
                });

            //module 'show code' button for snippet editing
            $btnCode.on("click", function () {
                var currentText = $btnCode.text(),
                    toggleText = $btnCode.attr("data-toggle-text");

                //hide settings
                $btnSettings.removeClass("active");
                $settings.removeClass("active");

                //toggle code
                $btnCode
                    .toggleClass("active")
                    .text(toggleText)
                    .attr("data-toggle-text", currentText);
                $code.toggleClass("active");
            });

            //module draggable snippet sizer
            interact($resizeLength[0])
                .resizable({
                    edges: {
                        left: $handleRight[0],
                        right: $handleLeft[0],
                        bottom: false,
                        top: false
                    },
                    onmove: function (e) {
                        var width = e.rect.width,
                            windowWidth = $(window).width();

                        if (width < 160) {
                            width = 160;
                        } else if ((width * 2) + 100 > windowWidth) {
                            width = (windowWidth - 100) / 2;
                        }

                        $preview
                            .find(snippetSource)
                            .addClass('resize-overlay');
                        $preview[0].style.width = (width * 2) + 'px';
                        $resizeLength[0].style.width = width + 'px';
                        $sizeIndicator.text((width * 2) + "px");
                        snippetActions.handleHeights($previewSource);
                    },
                    onend: function () {
                        $preview
                            .find(snippetSource)
                            .removeClass('resize-overlay');
                        snippetActions.handleHeights($previewSource);
                    }
                });
        }
    };

    $.fn.sgSnippet = function () {
        return this.each(function () {
            if (!$.data(this, "sgSnippet")) {
                $.data(this, "sgSnippet", new Plugin(this));
            }
        });
    };
})(jQuery, window, document, editorService, snippetActions, iframesService);

$(document).ready(function () {
    viewService.init();
});
