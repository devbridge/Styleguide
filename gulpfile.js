var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    browserSync = require('browser-sync'),
    config = require('./config.json');

gulp.task('browser-sync', ['start'], function() {
  browserSync.init({
    proxy: 'http://localhost:' + config.server.dev.env.PORT
  });
});

gulp.task('start', function () {
  nodemon({
    script: config.server.dev.path,
    nodeArgs: config.server.dev.nodeArgs,
    ext: 'js jade',
    env: config.server.dev.env
    //tasks: tasks to be made after 'ext' files are changed (array)
    //ignore: files to be ignores (array)
  });
})

gulp.task('default', ['browser-sync'], function() {
  gulp.watch(['./public/**/*.js', './public/**/*.css', './views/*.jade'], browserSync.reload);
});