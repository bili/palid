var gulp = require('gulp');
var jsmin = require('gulp-uglify');
var pump = require('pump');
var cssmin = require('gulp-clean-css');
var rename = require('gulp-rename');

gulp.task('jsmin', function (cb) {
    pump([
        gulp.src('src/script/*.js'),
        rename({suffix: '.min'}),
        jsmin(),
        gulp.dest('dist/script/')
    ], cb);
});

gulp.task('cssmin', function (cb) {
    var options = {advanced: false};
    pump([
        gulp.src('src/style/*.css'),
        rename({suffix: '.min'}),
        cssmin(options),
        gulp.dest('dist/style/')
    ], cb);
});

gulp.task('default', ['jsmin', 'cssmin'])
