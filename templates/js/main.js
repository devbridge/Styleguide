(function ( $, window, document, editorService, snippetActions, iframesService, undefined ) {
	function Plugin( element ) {
		this.$element = $( element );
		this.events();
	}

	Plugin.prototype = {
		events: function () {
			var $btnSettings = this.$element.find( ".js-snippet-settings-btn" ),
				$btnCode = this.$element.find( ".js-snippet-code-btn" ),
				$settings = this.$element.find( ".js-snippet-settings" ),
				$code = this.$element.find( ".js-snippet-code" ),
				$preview = this.$element.find( ".js-snippet-preview" ),
				$previewSource = $preview.find( "iframe" ),
				$handleLeft = this.$element.find( ".js-snippet-resize-handle-left" ),
				$handleRight = this.$element.find( ".js-snippet-resize-handle-right" ),
				$sizeIndicator = this.$element.find( ".js-snippet-size" ),
				$editors
				$originalValues = {};

			$btnSettings.on( "click", function () {
				$btnCode.removeClass( "active" );
				$btnSettings.toggleClass( "active" );
				iframesService.getTemplate(function ( template ) {
					if ( $btnSettings.hasClass("active") ) {
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

						if ( !$previewSource.hasClass('updated') ) {
							snippetActions.appendIframeContent($previewSource, template, $originalValues.code, $originalValues.css);
							$previewSource.load($.proxy(snippetActions.appendIframeContent, null, $previewSource, template, $editors.code.getValue(), $editors.css.getValue()));
							$editors.code.setValue($originalValues.code);
							$editors.css.setValue($originalValues.css);
						}

						$previewSource.removeClass('updated');
						editorService.removeFromEditForm($code.parent());
					}
					$code.hide();
					$preview.show();
					$settings.toggle();
				});
			});

			$btnCode.on( "click", function () {
				$btnSettings.removeClass( "active" );
				$btnCode.toggleClass( "active" );
				$settings.hide();
				$preview.show();
				$code.toggle();
			});

			$sizeIndicator.on('keyup', function () {
				$preview[0].style.width = $sizeIndicator.val();
			});

			interact( $preview[0] )
				.resizable({
					edges: {
						left: $handleLeft[0],
						right: $handleRight[0],
						bottom: false,
						top: false
					},
					onmove: function (e) {
						var target = e.target;

						if ( e.rect.width > 150 ) {
							target.style.width  = e.rect.width + 'px';
							$sizeIndicator.val( e.rect.width + "px" );
						}
					}
				});
		}
	};

	$.fn.sgSnippet = function () {
		return this.each( function () {
			if (!$.data( this, "sgSnippet" ) ) {
				$.data( this, "sgSnippet", new Plugin( this ) );
			}
		});
	};
})( jQuery, window, document, editorService, snippetActions, iframesService);

$( ".js-header-new-snippet" ).on( "click", function () {
	$( ".js-new-snippet-form" ).toggle();
});

$(document).ready(function(){
	viewService.init();
});