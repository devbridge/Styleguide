var gulp = require('gulp'),
    config = require('../gulp.config.js')();

module.exports = function(){

    return gulp.watch(config.svg.sourceFolder + '**/*.svg', function(){
        gulp.start('create-svg-sprite');
    });

};

