var editorService = (function ($) {
  var module = {};

  var addToNewForm = function () {
    var dom = require('ace/lib/dom'),
        codeEditor,
        cssEditor,
        commands = require('ace/commands/default_commands').commands
        toggleFullScreen = function ( editor, e ) {
          e.preventDefault();
          editor.keyBinding.$handlers[0].commands['Toggle Fullscreen'].exec(editor);
        };


    commands.push({
      name: 'Toggle Fullscreen',
      bindKey: 'F11',
      exec: function ( editor ) {
        dom.toggleCssClass(document.body, 'fullScreen');
        dom.toggleCssClass(editor.container, 'fullScreen-editor');
        editor.resize();
      }
    });

    commands.push({
      name: 'Exit Fullscreen',
      bindKey: 'ESC',
      exec: function ( editor ) {
        dom.removeCssClass(document.body, 'fullScreen');
        dom.removeCssClass(editor.container, 'fullScreen-editor');
        editor.resize();
      }
    });

    codeEditor = ace.edit('jsNewCode');
    cssEditor = ace.edit('jsNewCss');

    codeEditor.setTheme('ace/theme/monokai');
    cssEditor.setTheme('ace/theme/monokai');

    codeEditor.getSession().setMode('ace/mode/html');
    cssEditor.getSession().setMode('ace/mode/css');

    $('.js-toggle-code-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, codeEditor));
    $('.js-toggle-css-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, cssEditor));
  };

  module.addToEditForm = function ( snippetContainer ) {
    var currentEditor = snippetContainer.find('.js-edit-code'),
        snippetId = snippetContainer.attr('class').split(' ').pop(),
        currentId = snippetId + '-code';

    currentEditor.attr('id', currentId);
    currentEditor = ace.edit(currentId);
    currentEditor.setTheme('ace/theme/monokai');
    currentEditor.getSession().setMode('ace/mode/html');

    currentEditor = snippetContainer.find('.js-edit-css');
    currentId = snippetId + '-css';

    currentEditor.attr('id', currentId);
    currentEditor = ace.edit(currentId);
    currentEditor.setTheme('ace/theme/monokai');
    currentEditor.getSession().setMode('ace/mode/css');
  };

  module.init = function () {
    addToNewForm();
  };

  return module;
})(jQuery || {});