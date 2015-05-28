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
					onmove: function (e) {
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
	var dom = require("ace/lib/dom");
	var commands = require("ace/commands/default_commands").commands;
	commands.push({
		name: "Toggle Fullscreen",
		bindKey: "F11",
		exec: function(editor) {
			dom.toggleCssClass(document.body, "fullScreen");
			dom.toggleCssClass(editor.container, "fullScreen-editor");
			editor.resize();
		}
	});

	// setting up ace editor
    var codeEditor = ace.edit("codeEditor");
    codeEditor.setTheme("ace/theme/chrome");
    codeEditor.getSession().setMode("ace/mode/html");

    var cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/chrome");
    cssEditor.getSession().setMode("ace/mode/css");

	$('.js-toggle-code-editor-full-screen').on('click', function(e) {
		e.preventDefault();
		codeEditor.keyBinding.$handlers[0].commands['Toggle Fullscreen'].exec(codeEditor);
	});

	$('.js-toggle-css-editor-full-screen').on('click', function(e) {
		e.preventDefault();
		cssEditor.keyBinding.$handlers[0].commands['Toggle Fullscreen'].exec(cssEditor);
	});

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
		$(selector).off('submit.customSubmit');
		$(selector).on('submit.customSubmit', HandleCustomFormSubmit);
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
			data.code = codeEditor.getValue();
			data.inlineCss = cssEditor.getValue();
			$.ajax({
				type: "POST",
				url: '//'+window.location.hostname+':8080'+formToSubmit.attr('action'),
				data: data,
				success: function(){},
				dataType: 'JSON'
			}).fail(function() {
			    alert( "Failed to post!" );
			});
		}

		function CodeInputValid() {
			if ($('#codeEditor').length == 1 && codeEditor.getValue() == '') {
				$('#form-new-code-error').show();
				return false;
			} else {
				$('#form-new-code-error').hide();
				return true;
			}
		}
	}

});