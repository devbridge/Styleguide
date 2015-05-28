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
	var sassdata;
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

	var colorLiTemplate = $($('.snippet-colors > li').first()[0].cloneNode(true));
	var colorLocation = $('.snippet-colors')[0];
	var fontTemplate = $($('.snippet-fonts > li').first()[0].cloneNode(true));
	var smallFontsTemplate = fontTemplate.find('.snippet-fonts-small')[0];
	$.getJSON('../../db/sassdata.json', function(data){
		sassdata = data;
		HandleSassData(data[0]);
	});

	function HandleSassData(element) {
		var fonts = element.typography.map(function(elem) {
			return elem.value.split('\'')[1];
		}).filter(function(value, index, self) {
		    return self.indexOf(value) === index;
		});
		var fontFamilyPreview = $('.snippet-type-text > .row')[0];
		$('.snippet-type-text > .row').remove();
		$.each(fonts, function(index, val) {
			fontFamilyPreview.style.fontFamily = val;
			$(fontFamilyPreview).find('.js-font-family-name').text('Font family: '+val);
			$('.snippet-type-text')[0].appendChild(fontFamilyPreview.cloneNode(true));
		});
		colorLocation.innerHTML = '';
		$.each(element.colors, function(index, el) {
			colorLiTemplate.find('i')[0].style.background = index;
			colorLiTemplate.find('i').text(index);
			colorLiTemplate.find('.js-color-text').text(el.join(', '));
			colorLocation.appendChild(colorLiTemplate[0].cloneNode(true));
		});

		var fontsLocation = $('.snippet-fonts')[0];
		fontsLocation.innerHTML = '';
		$.each(element.typography, function(index, el) {
			var smallFontsContainer = fontTemplate.find('.js-small-fonts-container');
			fontTemplate.find('.snippet-fonts-small').remove();
			$.each(el.weights, function(index, fontWeight) {
				smallFontsTemplate.style.fontWeight = fontWeight;
				smallFontsContainer[0].appendChild(smallFontsTemplate.cloneNode(true));
			});
			fontTemplate.find('.snippet-fonts-variable').text(el.variable +': '+ el.value);
			fontTemplate.find('.js-set-font').each(function(index, fontElement) {
				fontElement.style.fontFamily = el.value;
			});
			fontsLocation.appendChild(fontTemplate[0].cloneNode(true));
		});
	}

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
				url: '//'+window.location.hostname+':3000'+formToSubmit.attr('action'),
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

    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false );
        xmlHttp.send( null );
        return xmlHttp;
    }
});