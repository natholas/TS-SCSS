var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var tsify = require('tsify')
var sourcemaps = require('gulp-sourcemaps')
var buffer = require('vinyl-buffer')
var browserSync = require('browser-sync').create()
var cleanCss = require('gulp-clean-css')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var del = require('del')

var paths = {
  pages: ['src/app/*.html'],
  scripts: ['src/app/main.ts'],
  styles: ['src/app/assets/styles/*.scss'],
  assets: ['src/app/assets/*']
}

gulp.task('clean-build-folder', function () {
  return del(['build/*']);
});


gulp.task('browser-sync', ['browserify', 'copyHtml', 'sass', 'copyAssets'], function () {
  browserSync.init({
    server: {
      baseDir: "./build"
    }
  })
})

gulp.task('copyHtml', function () {
  return gulp.src(paths.pages)
    .pipe(gulp.dest('build'))
})

gulp.task('copyAssets', function () {
  return gulp.src(paths.assets)
    .pipe(gulp.dest('build/assets'))
})

gulp.task('sass', function () {
  return gulp.src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
})

gulp.task('browserify', function () {
  return browserify({
    basedir: '.',
    debug: true,
    entries: paths.scripts,
    cache: {},
    packageCache: {}
  })
    .plugin(tsify)
    .transform('babelify', {
      presets: ['es2015'],
      extensions: ['.ts']
    })
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source('script.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'))
})

gulp.task('test', function() {
  console.log("test")
})

gulp.task('watch-ts', ['browserify'], function () {
  browserSync.reload()
})

gulp.task('watch-html', ['copyHtml'], function () {
  browserSync.reload()
})

gulp.task('watch-assets', ['copyAssets'], function () {
  browserSync.reload()
})

gulp.task('watchers', ['browser-sync'], function () {
  gulp.watch(paths.pages, ['watch-html'])
  gulp.watch(paths.scripts, ['watch-ts'])
  gulp.watch(paths.styles, ['sass'])
  gulp.watch(paths.assets, ['watch-assets'])
})

gulp.task('default', ['clean-build-folder'], function() {
  gulp.start('watchers')
})