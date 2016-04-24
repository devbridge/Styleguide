var categoryService = (function ($) {
    var module = {},
        cachedCategories,
        apiPath;

    module.init = function (callback) {
        var path = './config.txt';

        $.getJSON(path, function (data) {
            apiPath = '//' + window.location.hostname + ':' + data.serverPort + '/categories/';
        });
    };


    module.getCategories = function (callback) {
        if (!cachedCategories) {
            $.getJSON('./config.txt', function (config) {
                $.getJSON('//' + location.host + '/' + config.categories, function (categories) {
                    cachedCategories = categories;
                    callback(cachedCategories);
                });
            });
        } else {
            callback(cachedCategories);
        }
    };

    module.bindCategoriesToForm = function (selection) {
        module.getCategories(function (categories) {
            categories = categories.map(function (category) {
                return '<option value="' + category.id + '">' + category.name + '</option>';
            });
            selection.html(categories.join(''));
        });
    };

    module.getCategoryNameById = function (id) {
        var name;
        module.getCategories(function (categories) {
            categories.map(function (category) {
                if(category.id === id) {
                    name = category.name;
                }
            });
        });

        return name;
    };

    module.deleteById = function (categoryId, callback) {
        var request = $.ajax({
            method: 'DELETE',
            url: apiPath + categoryId,
            data: {},
            dataType: 'json'
        });

        request.done(function (data) {
            cachedCategories = null;
            callback(data);
        });

        request.fail(function () {
            callback('Failed to delete category! Maybe your styleguide server is down?');
        });
    };

    module.save = function (category, callback) {
        var request;

        if (!isNaN(category.id)) {
            request = $.ajax({
                method: 'PUT',
                url: apiPath + category.id,
                data: category,
                dataType: 'json'
            });
        } else {
            request = $.ajax({
                method: 'POST',
                url: apiPath,
                data: category,
                dataType: 'json'
            });
        }

        request.done(function (data) {
            cachedCategories = null;
            callback(data);
        });

        request.fail(function () {
            callback('Failed to save category! Maybe your styleguide server is down?');
        });
    };

    return module;
})(jQuery || {});