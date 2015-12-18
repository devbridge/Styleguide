var gulp = require('gulp'),
    config = require('../gulp.config.js')();

module.exports = function(){
    gulp.start(['watch-scss','watch-svg']);
};

