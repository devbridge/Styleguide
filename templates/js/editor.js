var editorService = (function($) {
  var module = {};

  var toggleFullScreen = function(editor, e) {
    e.preventDefault();
    editor.keyBinding.$handlers[0].commands['Toggle Fullscreen'].exec(editor);
  };

  var addToNewForm = function() {
    var dom = require('ace/lib/dom'),
      codeEditor,
      cssEditor,
      commands = require('ace/commands/default_commands').commands;


    commands.push({
      name: 'Toggle Fullscreen',
      bindKey: 'F11',
      exec: function(editor) {
        dom.toggleCssClass(document.body, 'fullScreen');
        dom.toggleCssClass(editor.container, 'fullScreen-editor');
        editor.resize();
      }
    });

    commands.push({
      name: 'Exit Fullscreen',
      bindKey: 'ESC',
      exec: function(editor) {
        dom.removeCssClass(document.body, 'fullScreen');
        dom.removeCssClass(editor.container, 'fullScreen-editor');
        editor.resize();
      }
    });

    codeEditor = ace.edit('jsNewCode');
    cssEditor = ace.edit('jsNewCss');
    cssEditor.setValue('#snippet { \n  \n}');

    codeEditor.setTheme('ace/theme/monokai');
    cssEditor.setTheme('ace/theme/monokai');

    codeEditor.getSession().setMode('ace/mode/html');
    cssEditor.getSession().setMode('ace/mode/css');

    $('.js-toggle-code-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, codeEditor));
    $('.js-toggle-css-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, cssEditor));
  };

  module.addToEditForm = function(snippetContainer) {
    var currentEditor = snippetContainer.find('.js-edit-code'),
      snippetId = snippetContainer.attr('class').split(' ').pop(),
      currentId = snippetId + '-code',
      editors = {};

    currentEditor.attr('id', currentId);
    currentEditor = ace.edit(currentId);
    currentEditor.setTheme('ace/theme/monokai');
    currentEditor.getSession().setMode('ace/mode/html');

    editors.code = currentEditor;

    snippetContainer.find('.js-toggle-code-full-screen').on('click', $.proxy(toggleFullScreen, null, currentEditor));

    currentEditor = snippetContainer.find('.js-edit-css');
    currentId = snippetId + '-css';

    currentEditor.attr('id', currentId);
    currentEditor = ace.edit(currentId);
    currentEditor.setTheme('ace/theme/monokai');
    currentEditor.getSession().setMode('ace/mode/css');

    editors.css = currentEditor;

    snippetContainer.find('.js-toggle-css-full-screen').on('click', $.proxy(toggleFullScreen, null, currentEditor));

    return editors;
  };

  module.removeFromEditForm = function(snippetContainer) {
    var currentEditor = snippetContainer.find('.js-edit-code'),
      snippetId = snippetContainer.attr('class').split(' ').pop(),
      currentId = snippetId + '-code',
      code,
      css;

    currentEditor = ace.edit(currentId);
    code = currentEditor.getValue();
    currentEditor.destroy();
    $(currentEditor.container).children().remove()
    $(currentEditor.container).text(code);

    snippetContainer.find('.js-toggle-code-full-screen').off('click');

    currentId = snippetId + '-css';

    currentEditor = ace.edit(currentId);
    css = currentEditor.getValue();
    currentEditor.destroy();
    $(currentEditor.container).children().remove();
    $(currentEditor.container).text(css);

    snippetContainer.find('.js-toggle-css-full-screen').off('click');
  };

  module.init = function() {
    addToNewForm();
  };

  return module;
})(jQuery || {});