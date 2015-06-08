(function ( $, window, document, editorService, undefined ) {
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
				$sizeIndicator = this.$element.find( ".js-snippet-size" );

			$btnSettings.on( "click", function () {
				$btnCode.removeClass( "active" );
				$btnSettings.toggleClass( "active" );
				if ( $btnSettings.hasClass("active") ) {
					editorService.addToEditForm($code.parent());
				} else {
					editorService.removeFromEditForm($code.parent());
				}
				$code.hide();
				$settings.add( $preview ).toggle();
			});

			$btnCode.on( "click", function () {

				$btnSettings.removeClass( "active" );
				$btnCode.toggleClass( "active" );
				$settings.hide();
				$preview.show();
				$code.toggle();
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
							$sizeIndicator.text( e.rect.width + "px" );
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
})( jQuery, window, document, editorService );

$( ".js-header-new-snippet" ).on( "click", function () {
	$( ".js-new-snippet-form" ).toggle();
});

$(document).ready(function(){
	viewService.init();
});