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

$( ".js-header-new-snippet" ).on( "click", function () {
	$( ".js-new-snippet-form" ).toggle();
});

//TODO: refactor
var parseSassData = function () {
	var fontTemplate = $($('.snippet-fonts > li').first()[0].cloneNode(true));
	var smallFontsTemplate = fontTemplate.find('.snippet-fonts-small')[0];
	$.getJSON('../../db/sassdata.json', function(data){
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
};

var bindCategoriesToForms = function () {
	var selections = $('.js-form-select'),
			len = selections.length,
			index,
			currentSelection;
	categoryService.getCategories(function ( categories ) {
		categories = categories.map(function ( category ) {
			return '<option value="' + category.id + '">' + category.name + '</option>';
		});
		for (index = 0; index < len; index++) {
			currentSelection = $(selections[index]);
			currentSelection.html(categories.join(''));
		}
	});
};

var createSnippet = function ( e ) {
	var form = $(this),
			fields = form.find('.js-form-submit-field'),
			currentField,
			len = fields.length,
			data = {},
			index;

	e.preventDefault();

	for (index = 0; len > index; index++) {
		currentField = $(fields[index]);
		data[currentField.data('js-field-name')] = currentField.val();
	}

	data.code = ace.edit('jsNewCode').getValue();
	data.inlineCss = ace.edit('jsNewCss').getValue();

	snippetService.postNew(data, function ( snippet ) {
		console.log(snippet);
	});
};

var editSnippet = function ( e ) {
	var form = $(this),
			fields = form.find('.js-form-submit-field'),
			snippetId = form.closest('.js-snippet').attr('id'),
			currentField,
			len = fields.length,
			data = {},
			index,
			code,
			css;

	e.preventDefault();

	for (index = 0; len > index; index++) {
		currentField = $(fields[index]);
		data[currentField.data('js-field-name')] = currentField.val();
	}

	code = ace.edit('snippet-' + snippetId + '-code').getValue();
	css = ace.edit('snippet-' + snippetId + '-css').getValue()

	data.code = code;
	data.inlineCss = css;

	snippetService.putEdited(data, snippetId, function ( snippet ) {
		console.log(snippet);
	});
};

var testFramesForDeleted = function () {
  iframesService.formFramesForDeleted(function ( frames, snippets ) {
  	var snippetId,
  			snippetContents,
				snippetContainer,
   			currentSnippetElement,
   			currentId,
   			index,
   			len = frames.length,
   			formFields,
   			fieldIndex,
   			fieldLen,
   			currentField;

   	snippetContainer = $('.js-snippet');
   	iframesService.getTemplate(function ( template ) {
   		for (index = 0; len > index; index++) {
   			currentId = snippets[index].id;
   			currentSnippetElement = snippetContainer.clone(true);
   			formFields = currentSnippetElement.find('.js-edit-snippet').find('.js-form-submit-field');
   			currentSnippetElement.attr('id', currentId);
   			snippetId = frames[index].attr('id');

   			currentSnippetElement.find('.js-snippet-name').html(snippets[index].name);
   			currentSnippetElement.find('.js-snippet-description').html(snippets[index].description);
   			currentSnippetElement.find('.js-edit-code').text(snippets[index].code);
   			currentSnippetElement.find('.js-edit-css').text(snippets[index].inlineCss);
   			currentSnippetElement.find('.js-snippet-code-preview').text(snippets[index].code);
   			currentSnippetElement.find('.js-snippet-source').html(frames[index]);
   			currentSnippetElement.addClass(snippetId);



   			currentSnippetElement.find('.js-delete-snippet').on('click', function () {
   				snippetService.deleteById(currentId, function ( data ) {
   					console.log(data);
   				});
   			});

   			for (fieldIndex = 0, fieldLen = formFields.length; fieldIndex < fieldLen; fieldIndex++) {
   				currentField = $(formFields[fieldIndex]);
   				currentField.val(snippets[index][currentField.data('js-field-name')]);
   			}

   			currentSnippetElement.sgSnippet();
   			currentSnippetElement.appendTo('.main');

   			snippetContents = $('#' + snippetId).contents();

        snippetContents.find('html').html(template);
        snippetContents.find('#snippet').html(snippets[index].code);

        editorService.addToEditForm(currentSnippetElement);
   		}
   	}); 	
  });
};

$(document).ready(function(){
	editorService.init();
	sassService.loadSass();
	
	testFramesForDeleted();
	bindCategoriesToForms();

	$('.js-create-snippet').submit(createSnippet);
	$('.js-edit-snippet').submit(editSnippet);
});