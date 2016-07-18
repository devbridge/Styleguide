var gulp        = require('gulp');
var exec        = require('child_process').exec;
 
gulp.task('start', function () {
    exec('live-server --open=styleguide');
    exec('styleguide start');
});
