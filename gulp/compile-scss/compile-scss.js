var gulp = require('gulp'),
    config = require('../gulp.config.js')(),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    neat = require('node-neat').includePaths;


module.exports = function() {

    var options = {
        includePaths: neat,
        outputStyle: 'nested', // 'compressed'
        sourceComments: false
    };

    return gulp.src(config.scss.src)
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass(options)
            .on('error', sass.logError)
        )
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.scss.cssFolder));
};


