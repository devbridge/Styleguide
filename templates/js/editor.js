var editorService = (function ($) {
    var module = {};
    var edits = [];

    //module editor controls: toggle full screen by html button
    var toggleFullScreen = function (editor, e) {
        e.preventDefault();
        editor
            .keyBinding
            .$handlers[0]
            .commands['Toggle Fullscreen']
            .exec(editor);
    };

    //module global editor controls
    var editorCommands = function () {
        var dom = require('ace/lib/dom'),
            commands = require('ace/commands/default_commands').commands;

        //editor controls: toggle screen function by keyboard
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

        //editor controls: exit screen function by keyboard
        commands.push({
            name: 'Exit Fullscreen',
            bindKey: 'ESC',
            exec: function (editor) {
                dom.removeCssClass(document.body, 'fullScreen');
                dom.removeCssClass(editor.container, 'fullScreen-editor');
                editor.resize();
            }
        });

        //editor controls: update snippet when ctrl + s
        commands.push({
            name: 'Save on Ctrl-S',
            bindKey: {
                win: 'Ctrl-S',
                mac: 'Command-S'
            },
            exec: function(editor) {
                $(editor.container)
                    .parents(".js-edit-snippet, .js-create-snippet")
                    .find('button[type="submit"]')
                    .click(); //button click triggers validation
            }
        });
    };

    //module editors configuration for new snippet
    var addToNewForm = function () {
        var codeEditor,
            cssEditor;

        //html
        codeEditor = ace.edit('jsNewCode');
        codeEditor.setTheme('ace/theme/idle_fingers');
        codeEditor.setOptions({
            fontSize: "13px"
        });
        codeEditor
            .getSession()
            .setMode('ace/mode/html');
        codeEditor
            .getSession()
            .setUseWorker(false);

        //css
        cssEditor = ace.edit('jsNewCss');
        cssEditor.setValue('#snippet { \n  \n}');
        cssEditor.setTheme('ace/theme/idle_fingers');
        cssEditor
            .getSession()
            .setMode('ace/mode/css');
        cssEditor
            .getSession()
            .setUseWorker(false);

        //events binding - editor full screen buttons
        $('.js-toggle-code-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, codeEditor));
        $('.js-toggle-css-editor-full-screen').on('click', $.proxy(toggleFullScreen, null, cssEditor));
    };

    //module editors configuration for editable snippets
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
            currentEditor.setTheme('ace/theme/idle_fingers');
            currentEditor.setOptions({
                fontSize: "13px"
            });;
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

    //module destroy editors when edit mode is closed
    module.removeFromEditForm = function (snippetContainer) {
        var snippetId = snippetContainer.attr('class').match(/(^|\s)snippet-\S+(\s|$)/).shift().trim(),
            codeId = snippetId + '-code',
            cssId = snippetId + '-css';

        function removeFromEditor(currentId, type) {
            var currentEditor = ace.edit(currentId),
                tempText = currentEditor.getValue(),
                containerClone = currentEditor.container.cloneNode(false);

            containerClone.textContent = currentEditor.getValue();

            currentEditor.destroy();

            // Replace container with cloned copy to remove all event listeners
            currentEditor.container.parentNode.replaceChild(containerClone, currentEditor.container);

            snippetContainer
                .find('.js-toggle-' + type + '-full-screen')
                .off('click');
        }

        removeFromEditor(codeId, 'code');
        removeFromEditor(cssId, 'css');
    };

    module.init = function () {
        editorCommands();
        addToNewForm();
    };

    return module;
})(jQuery || {});
