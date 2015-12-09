(function ($, window, document, editorService, snippetActions, iframesService) {
    function Plugin(element) {
        this.$element = $(element);
        this.events();
    }

    Plugin.prototype = {
        events: function () {
            var $btnSettings = this.$element.find(".js-snippet-settings-btn"),
                $btnCode = this.$element.find(".js-snippet-code-btn"),
                $settings = this.$element.find(".js-snippet-settings"),
                $code = this.$element.find(".js-snippet-code"),
                $preview = this.$element.find(".js-snippet-preview"),
                $resizeLength = this.$element.find(".js-resize-length"),
                $previewSource = $preview.find("iframe"),
                $handleLeft = this.$element.find(".js-snippet-resize-handle-left"),
                $handleRight = this.$element.find(".js-snippet-resize-handle-right"),
                $sizeIndicator = this.$element.find(".js-snippet-size"),
                $btnCancel = this.$element.find(".js-btn-cancel"),
                $snippetSource = ".js-snippet-source",
                $editors,
                $originalValues = {};

            $btnSettings.on("click", function () {
                $btnCode.removeClass("active");
                $btnSettings.toggleClass("active");

                iframesService.getTemplate(function (template) {
                    if ($btnSettings.hasClass("active")) {
                        $editors = editorService.addToEditForm($code.parent());
                        $originalValues.code = $editors.code.getValue();
                        $originalValues.css = $editors.css.getValue();

                        function onSourceChange () {
                            snippetActions.appendIframeContent($previewSource, template, $editors.code.getValue(), $editors.css.getValue());
                            $previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, template, $editors.code.getValue(), $editors.css.getValue()));
                        }

                        $editors
                            .code
                            .on('change', onSourceChange);
                        $editors
                            .css
                            .on('change', onSourceChange);
                    } else {
                        $editors
                            .code
                            .off('change');
                        $editors
                            .css
                            .off('change');

                        if (!$previewSource.hasClass('updated')) {
                            snippetActions.appendIframeContent($previewSource, template, $originalValues.code, $originalValues.css);
                            $previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, template, $editors.code.getValue(), $editors.css.getValue()));

                            $editors
                                .code
                                .setValue($originalValues.code);
                            $editors
                                .css
                                .setValue($originalValues.css);
                        }

                        $previewSource.removeClass('updated');
                        editorService.removeFromEditForm($code.parent());
                    }
                    $code.hide();
                    $settings.toggle();
                });
            });

            //module 'show code' button for snippet editing
            //TODO improvement: 'hide code' text?
            $btnCode.on("click", function () {
                //hide settings
                $btnSettings.removeClass("active");
                $settings.hide();

                //toggle code
                $btnCode.toggleClass("active");
                $code.toggle();
            });

            //module 'cancel' button for snippet editing
            $btnCancel.on("click", function () {
                $btnSettings.removeClass("active");
                $settings.hide();
                $preview.show();
            });

            //TODO clarify: check if used
            $sizeIndicator.on('keyup', function () {
                $preview.find('iframe').get(0).style.width = $sizeIndicator.val();
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
                        var target = e.target,
                            iframe = $(target).find('iframe').get(0);

                        if (e.rect.width > 155 && e.rect.width < 605) {
                            $preview
                                .find($snippetSource)
                                .addClass('resize-overlay');
                            $preview[0].style.width = (e.rect.width * 2) + 'px';
                            $resizeLength[0].style.width = e.rect.width + 'px';
                            $sizeIndicator.text((e.rect.width * 2) + "px");
                        }
                    },
                    onend: function () {
                        $preview
                            .find($snippetSource)
                            .removeClass('resize-overlay');
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