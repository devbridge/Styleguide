var gulp = require('gulp');
var sass = require('gulp-sass');
var sassvg = require('gulp-sassvg');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
    return gulp.src('./templates/scss/main.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: require('node-bourbon').includePaths
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./templates/content'))
        .pipe(gulp.dest('./_demo/styleguide/content'));
});

gulp.task('sassvg', function () {
    return gulp.src('./templates/content/icons/**/*.svg')
        .pipe(sassvg({
            outputFolder: './templates/scss/icons'
        }));
});

gulp.task('icons', ['sassvg'], function(callback) {
    return gulp.start('sass');
});

gulp.task('watch', function () {
    gulp.watch(['./templates/scss/**/*.scss', '!./templates/scss/icons/*.scss'], ['sass']);
});
