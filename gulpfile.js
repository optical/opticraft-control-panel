var gulp = require('gulp');
var tsc = require('gulp-typescript');
var tsd = require('gulp-tsd');
var tslint = require('gulp-tslint');
var browserify = require('browserify');
var gutil = require('gulp-util');
var stringify = require('stringify');
var source = require('vinyl-source-stream');
var path = require('path');
var _ = require('lodash');

function makeBundle(options) {
    var bundle = browserify(_.merge({ debug: true }, options))
        .plugin('tsify', { noImplicitAny: true })
        .transform(stringify())
        .add([path.resolve('./src/client/app.ts')]);

    var errors = [];
    var errorHandler = function (error) {
        if (error.fileName) {
            gutil.log(gutil.colors.red('TS Error') + ':', error.message, gutil.colors.magenta(error.fileName) + ':' + gutil.colors.cyan(error.line) + ':' + gutil.colors.cyan(error.column));
        }
        errors.push(error);
    };

     bundle.on('bundle', function (pipeline) {
         pipeline.on('error', errorHandler);
         pipeline.once('end', function () {
             pipeline.removeListener('error', errorHandler);
             if (errors.length) {
                 bundle.emit('error', new Error('browserify failed'));
             }
             errors = [];
         });
     });


    bundle.name = 'bundle.js';
    return bundle;
}

function runBundle(bundle) {
    return bundle.bundle().pipe(source(bundle.name)).pipe(gulp.dest('./dist/web/res'));
}

    function watchBundle(bundle, path) {
    gutil.log('Change detected in ' + path);
    bundle.on('error', function (err) { console.log(err); });
    gutil.log('Rebundling', gutil.colors.magenta(bundle.name));

    var start = Date.now();
    var stream = runBundle(bundle);
    stream.on('end', function() {
        gutil.log(gutil.colors.magenta(bundle.name), 'generated in', gutil.colors.cyan(Date.now() - start), gutil.colors.cyan('ms'));
    });
}

gulp.task('browserify', ['tsd'], function () {
    return runBundle(makeBundle());
});

gulp.task('bootstrap', function() {
    return gulp.src('node_modules/bootstrap/dist/**/*.*')
        .pipe(gulp.dest('dist/web/res/bootstrap'));
});

gulp.task('fontawesome', function() {
    return gulp.src('node_modules/font-awesome/*(fonts|css)/*.*')
        .pipe(gulp.dest('dist/web/res/font-awesome'));
});

gulp.task('res', function() {
    return gulp.src('src/web/res/**/*.*')
        .pipe(gulp.dest('dist/web/res/'));
});

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: 'tsd.json'
    }, callback);
});

gulp.task('tsc', ['tsd'], function () {
    var options = {
        module: 'commonjs',
        target: 'es5'
    };

    return gulp.src(['src/!(client)/**/*.ts'])
        .pipe(tsc(options))
        .pipe(gulp.dest('dist'));
});

gulp.task('tslint', ['tsc'], function () {
    return gulp.src(['src/**/*.ts'])
        .pipe(tslint({ configuration: require('./tslint.json') }))
        .pipe(tslint.report('verbose'));
});

gulp.task('watch', ['default'], function () {
    gulp.watch(['src/!(client)/**/*.ts'], ['tsc']);
    gulp.watch(['src/web/res/**/*.*'], ['res']);

    return gulp.watch('src/client/**/*.ts', function(event) {
        watchBundle(makeBundle(), event.path);
    });

});

gulp.task('build', ['tsc', 'tslint', 'res', 'browserify', 'bootstrap', 'fontawesome']);
gulp.task('default', ['build']);
