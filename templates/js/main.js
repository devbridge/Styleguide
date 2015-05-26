;(function ( $, window, document, undefined ) {
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
					onmove: function ( e ) {
						var target = e.target;
						
						if ( e.rect.width > 319 ) {
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
})( jQuery, window, document );

$( ".js-snippet" ).sgSnippet();

$( ".js-header-new-snippet" ).on( "click", function () {
	$( ".js-new-snippet-form" ).toggle();
});

$(document).ready(function(){

	// setting up ace editor
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/css");

	// set categories
	$('#form-new-category').each(function(index, el) {
		var comboBox = $(this);
		$.getJSON('../config.json', function(data) {
			var categories = [];
			$.each(data.categories, function(index, val) {
				categories.push('<option value="'+val.id+'">'+val.name+'</option>');
			});
			comboBox.html(categories.join(''));
		});
	});

	$('.js-submit-form-button').on('click', function(event) {
		event.preventDefault();
		var selector = $(this).data('submit-form');
		$(selector).on('submit', HandleCustomFormSubmit);
		$(selector).submit();
	});

	function HandleCustomFormSubmit(event) {
		event.preventDefault();
		var formToSubmit = $(this);
		formToSubmit.validate();
		var submitFields = $('.js-form-submit-field');
		var invalidFields = submitFields.filter(function(){ return !$(this).valid();});
		if (invalidFields.length == 0 && CodeInputValid()) {
			var data = {};
			submitFields.each(function(index, el) {
				data[$(this).data('js-field-name')] = $(this).val();
			});
			data.code = editor.getValue();
			$.ajax({
			  type: "POST",
			  url: formToSubmit.attr('action'),
			  data: data,
			  success: function(){},
			  dataType: 'JSON'
			}).fail(function() {
			    alert( "Failed to post!" );
			});
		}

		function CodeInputValid() {
			if ($('#editor').length == 1 && editor.getValue() == '') {
				$('#form-new-code-error').show();
				return false;
			} else {
				$('#form-new-code-error').hide();
				return true;
			}
		}
	}

});

