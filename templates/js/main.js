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