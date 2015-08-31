(function ($, window, document, editorService, snippetActions, iframesService, undefined) {
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
				$previewSource = $preview.find("iframe"),
				$handleLeft = this.$element.find(".js-snippet-resize-handle-left"),
				$handleRight = this.$element.find(".js-snippet-resize-handle-right"),
				$sizeIndicator = this.$element.find(".js-snippet-size"),
				$btnCancel = this.$element.find(".js-btn-cancel"),
				$newSnippetForm = $(".js-new-snippet-form"),
				$newSnippetCancel = $(".js-new-snippet-cancel"),
				$editors,
				$originalValues = {};

			$btnSettings.on("click", function () {
				$btnCode.removeClass("active");
				$btnSettings.toggleClass("active");

				if ($(this).hasClass("active")) {
					$preview.hide();
				} else {
					$preview.show();
				}

				iframesService.getTemplate(function (template) {
					if ($btnSettings.hasClass("active")) {
						$editors = editorService.addToEditForm($code.parent());
						$originalValues.code = $editors.code.getValue();
						$originalValues.css = $editors.css.getValue();
						$editors.code.on('change', function () {
							snippetActions.appendIframeContent($previewSource, template, $editors.code.getValue(), $editors.css.getValue());
							$previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, template, $editors.code.getValue(), $editors.css.getValue()));
						});
						$editors.css.on('change', function () {
							snippetActions.appendIframeContent($previewSource, template, $editors.code.getValue(), $editors.css.getValue());
							$previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, template, $editors.code.getValue(), $editors.css.getValue()));
						});
					} else {
						$editors.code.off('change');
						$editors.css.off('change');

						if (!$previewSource.hasClass('updated')) {
							snippetActions.appendIframeContent($previewSource, template, $originalValues.code, $originalValues.css);
							$previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, template, $editors.code.getValue(), $editors.css.getValue()));
							$editors.code.setValue($originalValues.code);
							$editors.css.setValue($originalValues.css);
						}

						$previewSource.removeClass('updated');
						editorService.removeFromEditForm($code.parent());
					}
					$code.hide();

					$settings.toggle();
				});
			});

			$btnCode.on("click", function () {
				$btnSettings.removeClass("active");
				$btnCode.toggleClass("active");
				$settings.hide();

				if ($(this).hasClass("active")) {
					$preview.hide();
				} else {
					$preview.show();
				}

				$code.toggle();
			});

			$btnCancel.on("click", function () {
				$btnSettings.removeClass("active");
				$settings.hide();
				$preview.show();
			});

			$newSnippetCancel.on("click", function () {
				$newSnippetForm.hide();
			});

			$sizeIndicator.on('keyup', function () {
				$preview.find('iframe').get(0).style.width = $sizeIndicator.text();
			});

			interact($preview[0])
				.resizable({
					edges: {
						left: $handleLeft[0],
						right: $handleRight[0],
						bottom: false,
						top: false
					},
					onmove: function (e) {
						var target = e.target,
							iframe = $(target).find('iframe').get(0);

						$(target).children(':first').children('div').addClass('iframe-overlay');

						snippetActions.handleHeights($(target).find('iframe'));

						if (e.rect.width > 150) {
							iframe.style.width = e.rect.width + 'px';
							target.style.width = e.rect.width + 'px';
							$sizeIndicator.text(e.rect.width + "px");
						}
					},
					onend: function (e) {
						var target = e.target;

						$(target).children(':first').children('div').removeClass('iframe-overlay');
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

$(".js-header-new-snippet").on("click", function () {
	$(".js-new-snippet-form").toggle();
});

$(document).ready(function () {
	viewService.init();
});