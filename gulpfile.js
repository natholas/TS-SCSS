var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var tsify = require('tsify')
var sourcemaps = require('gulp-sourcemaps')
var buffer = require('vinyl-buffer')
var browserSync = require('browser-sync').create()
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var del = require('del')
var uglifycss = require('gulp-uglifycss')
var uglify = require('gulp-uglify')
var runSequence = require('run-sequence')

var sources = {
  pages: ['src/app/*.html'],
  scripts: ['src/app/*.ts', 'src/app/**/*.ts'],
  styles: ['src/app/assets/styles/*.scss'],
  assets: ['src/app/assets/*']
}

var dest = './dist'

gulp.task('clean-build-folder', function () {
  return del([dest + '/*'])
})


gulp.task('browser-sync', ['browserify', 'copyHtml', 'sass', 'copyAssets'], function () {
  browserSync.init({
    server: {
      baseDir: dest
    }
  })
})

gulp.task('copyHtml', function () {
  return gulp.src(sources.pages)
    .pipe(gulp.dest(dest))
})

gulp.task('copyAssets', function () {
  return gulp.src(sources.assets)
    .pipe(gulp.dest(dest + '/assets'))
})

gulp.task('sass', function () {
  return gulp.src(sources.styles)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream())
})

gulp.task('browserify', function () {
  return browserify({
    basedir: '.',
    debug: true,
    entries: 'src/app/main.ts',
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
    .pipe(gulp.dest(dest))
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
  gulp.watch(sources.pages, ['watch-html'])
  gulp.watch(sources.scripts, ['watch-ts'])
  gulp.watch(sources.styles, ['sass'])
  gulp.watch(sources.assets, ['watch-assets'])
})

gulp.task('default', ['clean-build-folder'], function() {
  gulp.start('watchers')
})

gulp.task('build-tasks', ['browserify', 'copyHtml', 'sass', 'copyAssets'])

gulp.task('optimization-tasks', ['uglifyCss', 'uglyfyJS'])

gulp.task('build', function () {
  
  runSequence(
    'clean-build-folder',
    'build-tasks'
  )
})

gulp.task('build-prod', function () {
  runSequence(
    'clean-build-folder',
    'build-tasks',
    'optimization-tasks'
  )
})

gulp.task('uglifyCss', function () {
  return gulp.src(dest + '/*.css')
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(gulp.dest(dest));
})

gulp.task('uglyfyJS', function () {
  return gulp.src(dest + '/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(dest));
})