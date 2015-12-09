var editorService = (function ($) {
    var module = {};

    var toggleFullScreen = function (editor, e) {
        e.preventDefault();
        editor
            .keyBinding
            .$handlers[0]
            .commands['Toggle Fullscreen']
            .exec(editor);
    };

    var addToNewForm = function () {
        var dom = require('ace/lib/dom'),
            codeEditor,
            cssEditor,
            commands = require('ace/commands/default_commands').commands;

        commands.push({
            name: 'Toggle Fullscreen',
            bindKey: 'F11',
            exec: function (editor) {
                dom.toggleCssClass(document.body, 'fullScreen');
                dom.toggleCssClass(editor.container, 'fullScreen-editor');
                editor.resize();
                editor.focus();
            }
        });

        commands.push({
            name: 'Exit Fullscreen',
            bindKey: 'ESC',
            exec: function (editor) {
                dom.removeCssClass(document.body, 'fullScreen');
                dom.removeCssClass(editor.container, 'fullScreen-editor');
                editor.resize();
            }
        });

        codeEditor = ace.edit('jsNewCode');
        codeEditor.setTheme('ace/theme/github');
        codeEditor
            .getSession()
            .setMode('ace/mode/html');
        codeEditor
            .getSession()
            .setUseWorker(false);


        cssEditor = ace.edit('jsNewCss');
        cssEditor.setValue('#snippet { \n  \n}');
        cssEditor.setTheme('ace/theme/github');
        cssEditor
            .getSession()
            .setMode('ace/mode/css');
        cssEditor
            .getSession()
            .setUseWorker(false);

        $('.js-toggle-code-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, codeEditor));
        $('.js-toggle-css-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, cssEditor));
    };

    module.addToEditForm = function (snippetContainer) {
        var snippetId = snippetContainer.attr('class').match(/(^|\s)snippet-\S+(\s|$)/).shift().trim(),
            codeId = snippetId + '-code',
            cssId = snippetId + '-css',
            codeEditor = snippetContainer.find('.js-edit-code'),
            cssEditor = snippetContainer.find('.js-edit-css'),
            editors = {};

        function defineEditor (currentEditor, currentId, mode, type) {
            currentEditor.attr('id', currentId);
            currentEditor = ace.edit(currentId);
            currentEditor.setTheme('ace/theme/github');
            currentEditor
                .getSession()
                .setMode('ace/mode/' + mode);
            currentEditor
                .getSession()
                .setUseWorker(false);

            snippetContainer
                .find('.js-toggle-' + type + '-full-screen')
                .on('click', $.proxy(toggleFullScreen, null, currentEditor));

            return currentEditor;
        }

        editors.code = defineEditor(codeEditor, codeId, 'html', 'code');
        editors.css = defineEditor(cssEditor, cssId, 'css', 'css');

        return editors;
    };

    module.removeFromEditForm = function (snippetContainer) {
        var snippetId = snippetContainer.attr('class').match(/(^|\s)snippet-\S+(\s|$)/).shift().trim(),
            codeId = snippetId + '-code',
            cssId = snippetId + '-css';

        function removeFromEditor(currentId, type) {
            var currentEditor = ace.edit(currentId),
                tempText = currentEditor.getValue();

            currentEditor.destroy();
            $(currentEditor.container)
                .children()
                .remove();
            $(currentEditor.container).text(tempText);

            snippetContainer
                .find('.js-toggle-' + type + '-full-screen')
                .off('click');
        }

        removeFromEditor(codeId, 'code');
        removeFromEditor(cssId, 'css');
    };

    module.init = function () {
        addToNewForm();
    };

    return module;
})(jQuery || {});