var categoryService = (function ($) {
    var module = {},
        cachedCategories;

    module.getCategories = function (callback) {
        if (!cachedCategories) {
            $.getJSON('../styleguide/config.txt', function (config) {
                $.getJSON('../' + config.categories, function (categories) {
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

    return module;
})(jQuery || {});