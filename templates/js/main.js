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
		$(selector).submit();
	});


	// snipet form validation
	$("#SnipetForm").validate();

	$('#SnipetForm').on('submit', function(event) {
		event.preventDefault();
		if ($('#form-new-name').valid() && $('#form-new-category').valid() && CodeInputValid()){
			var data = {};
			data.name = $('#form-new-name').val();
			data.category = $('#form-new-category').val();
			data.code = editor.getValue();
			data.description = $('#form-new-desciption').val();
			data.inlineCss = $('#form-new-inlinecss').val();
			console.log(data);
			$.ajax({
			  type: "POST",
			  url: 'http://localhost:8080/snippets', // where to post?
			  data: data,
			  success: function(){},
			  dataType: 'JSON'
			}).fail(function() {
			    alert( "Failed to post!" );
			});
		}

		function CodeInputValid() {
			if (editor.getValue() == '') {
				$('#form-new-code-error').show();
				return false;
			} else {
				$('#form-new-code-error').hide();
				return true;
			}
		}
	});

});