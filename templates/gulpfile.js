var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer');
function showError(error) {
	console.log(error.toString());
	this.emit('end');
}

gulp.task('sass', function() {
	return gulp.src('scss/main.scss')
		.pipe(sass({outputStyle: 'compressed', includePaths: require('node-bourbon').includePaths}))
		.on('error', showError)
		.pipe(autoprefixer('last 2 version', 'ios 6', 'android 4'))
		.pipe(gulp.dest('content'));
});

gulp.task('default', function() {
	gulp.start('sass');
});

gulp.task('watch', function() {
	gulp.watch('scss/**/*.scss', ['sass']);
});
