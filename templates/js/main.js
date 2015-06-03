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

var testFramesForDeleted = function () {
  iframesService.formFramesForDeleted(function ( frames, snippets ) {
		snippetActions.drawSnippets(frames, snippets);
  });
};

var testFramesForCategory = function () {
  iframesService.formFramesForCategory(3, function ( frames, snippets ) {
  	snippetActions.drawSnippets(frames, snippets);
  });
};

var redrawPage = function ( categoryId ) {
	$('.main').empty();
	
	if ( categoryId ) {
		console.log(categoryId);
		iframesService.formFramesForCategory(categoryId, function ( frames, snippets ) {
			snippetActions.drawSnippets(frames, snippets);
		});
		return;
	}
	
	sassService.loadSass(function () {
		$('.main').append($('.js-sass-page').children().clone(true));
	});
};

var buildNavigation = function () {
	var navigation = $('.js-navigation'),
			currentPage = navigation.find('.js-current-page'),
			navList = navigation.find('.js-navigation-list'),
			pages = [{ name: 'Colors, Typography' }],
			iteratingPage,
			pageElement,
			index,
			len;

	currentPage.text(pages[0].name);
	categoryService.getCategories(function ( categories ) {
		pages = pages.concat(categories);
		len = pages.length;

		for (index = 0; len > index; index++) {
			iteratingPage = pages[index];
			pageElement = $('<a href="#" data-id="' + iteratingPage.id + '">' + iteratingPage.name + '</a>');
			pageElement.on('click', function () {
				redrawPage($(this).data('id'));
			});
			navList.append(pageElement);
		}
	});
};

$(document).ready(function(){
	editorService.init();
	buildNavigation();
	
	
	sassService.loadSass(function () {
		$('.main').append($('.js-sass-page').children().clone(true));
	});
	
	

	categoryService.bindCategoriesToForms();

	$('.js-create-snippet').submit(snippetActions.createSnippet);
	$('.js-edit-snippet').submit(snippetActions.editSnippet);
});