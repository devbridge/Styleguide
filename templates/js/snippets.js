var snippetService = (function ($, categoryService) {
    var module = {},
        scrapePath,
        apiPath;

    module.getCategoryItemsCount = function (category, callback) {
        if (typeof category.id === 'number') {
            module.getByCategoryId(category.id, function (snippets) {
                callback(snippets.length, category);
            });
        } else if (typeof category.id === 'string' && category.id === 'deleted') {
            module.getDeletedSnippets(function (snippets) {
                callback(snippets.length, category);
            });
        } else if (typeof category.id === 'string') {
            callback(null, category);
        }
    };

    module.getScrapePath = function (whatToScrape) {
        return scrapePath + whatToScrape;
    };

    module.init = function (callback) {
        var path = './config.txt',
            request;

        $.getJSON(path, function (data) {
            apiPath = '//' + window.location.hostname + ':' + data.serverPort + '/snippets/';
            scrapePath = '//' + window.location.hostname + ':' + data.serverPort + '/scrape/';
            request = $.ajax({
                method: 'GET',
                url: apiPath + 'duplicates',
                data: {},
                dataType: 'json'
            });

            request.done(function (data) {
                callback(data);
            });

            request.fail(function () {
                callback('VIEW ONLY MODE - Server is not running');
            });
        });
    };

    module.getDeletedSnippets = function (callback) {
        categoryService.getCategories(function (categories) {
            var len = categories.length,
                index,
                deletedSnippets = [],
                path,
                cacheBust = '?t=' + Date.now();

            $.ajaxSetup({
                async: false
            });

            for (index = 0; index < len; index++) {
                path = './db/' + categories[index].name + '.txt' + cacheBust;

                $.getJSON(path, function (data) {
                    var filteredSnippets = data.filter(function (obj) {
                        return obj.isDeleted;
                    });

                    filteredSnippets = filteredSnippets.map(function (obj) {
                        obj.category = categories[index].id;
                        return obj;
                    });

                    deletedSnippets = deletedSnippets.concat(filteredSnippets);

                    deletedSnippets = deletedSnippets.sort(function (obj1, obj2) {
                        return obj1.id - obj2.id;
                    });
                });
            }

            $.ajaxSetup({
                async: true
            });

            callback(deletedSnippets);
        });
    };

    module.getByCategoryId = function (categoryId, callback) {
        categoryService.getCategories(function (categories) {
            var len = categories.length,
                index,
                path,
                cacheBust = '?t=' + Date.now();

            for (index = 0; index < len; index++) {
                if (categories[index].id === categoryId) {
                    break;
                }
            }

            path = './db/' + categories[index].name + '.txt' + cacheBust;

            $.getJSON(path, function (data) {
                data = data.filter(function (obj) {
                    return !obj.isDeleted;
                });

                data = data.map(function (obj) {
                    obj.category = categoryId;
                    return obj;
                });

                data = data.sort(function (obj1, obj2) {
                    return obj1.id - obj2.id;
                });

                callback(data);
            });
        });
    };

    module.getById = function (snippetId, callback) {
        categoryService.getCategories(function (categories) {
            var len = categories.length,
                index,
                desireableSnippet,
                path,
                cacheBust = '?t=' + Date.now();

            $.ajaxSetup({
                async: false
            });

            for (index = 0; index < len; index++) {
                path = './db/' + categories[index].name + '.txt' + cacheBust;

                $.getJSON(path, function (data) {
                    desireableSnippet = data.filter(function (obj) {
                        if (obj.id === snippetId) {
                            return obj;
                        }
                    })[0];

                    if (desireableSnippet) {
                        desireableSnippet.category = categories[index].id;
                        callback(desireableSnippet);
                    }

                });
            }

            $.ajaxSetup({
                async: true
            });

            if (!desireableSnippet) {
                callback(desireableSnippet);
            }

        });
    };

    module.postNew = function (snippet, callback) {
        var request = $.ajax({
            method: 'POST',
            url: apiPath,
            data: snippet,
            dataType: 'json'
        });

        request.done(function (data) {
            callback(data);
        });

        request.fail(function () {
            callback('Failed to create new snippet! Maybe your styleguide server is down?');
        });

    };

    module.putEdited = function (snippet, id, callback) {
        var request = $.ajax({
            method: 'PUT',
            url: apiPath + id,
            data: snippet,
            dataType: 'json'
        });

        request.done(function (data) {
            callback(data);
        });

        request.fail(function () {
            callback('Failed to edit snippet! Maybe your styleguide server is down?');
        });
    };

    module.deleteById = function (snippetId, callback) {
        var request = $.ajax({
            method: 'DELETE',
            url: apiPath + snippetId,
            data: {},
            dataType: 'json'
        });

        request.done(function (data) {
            callback(data);
        });

        request.fail(function () {
            callback('Failed to delete snippet! Maybe your styleguide server is down?');
        });
    };


    return module;
})(jQuery || {}, categoryService);
