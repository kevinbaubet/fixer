const package = require('./package.json');
const plugins = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});
const uglify = require('gulp-uglify-es').default;

// Compilation SASS
plugins.gulp.task('sass', function (event) {
    plugins.pump([
        plugins.gulp.src('./src/**/*.scss'),
        plugins.sass(package.sass),
        plugins.postcss([
            plugins.autoprefixer(package.autoprefixer),
            plugins.postcssPxtorem(package.pxtorem)
        ]),
        plugins.gulp.dest('./dist/')
    ], event);
});

// Watch SASS
plugins.gulp.task('watchsass', function () {
    plugins.gulp.watch('./src/**/*.scss', ['sass']);
});

// Minify
plugins.gulp.task('minify', function (event) {
    plugins.pump([
        plugins.gulp.src('./src/**/*.js'),
        uglify(),
        plugins.rename(function (path) {
            path.extname = '.min.js'
        }),
        plugins.gulp.dest('./dist/')
    ], event);
});

// Alias
plugins.gulp.task('default', ['sass', 'watchsass']);
plugins.gulp.task('prod', ['sass', 'minify']);