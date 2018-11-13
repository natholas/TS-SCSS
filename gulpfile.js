const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const tsify = require('tsify')
const sourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
const uglifycss = require('gulp-uglifycss')
const uglify = require('gulp-uglify')
const runSequence = require('run-sequence')

const port = 3030

const sources = {
  pages: ['src/app/*.html'],
  scripts: ['src/app/*.ts', 'src/app/**/*.ts'],
  styles: ['src/app/assets/styles/*.scss'],
  assets: ['src/app/assets/*']
}

const dest = './dist'

gulp.task('clean-build-folder', () => {
  return del([dest + '/*'])
})


gulp.task('browser-sync', ['browserify', 'copyHtml', 'sass', 'copyAssets'], () => {
  browserSync.init({
    port: port,
    server: {
      baseDir: dest,
    }
  })
})

gulp.task('copyHtml', () => {
  return gulp.src(sources.pages)
    .pipe(gulp.dest(dest))
})

gulp.task('copyAssets', () => {
  return gulp.src(sources.assets)
    .pipe(gulp.dest(dest + '/assets'))
})

gulp.task('sass', () => {
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

gulp.task('browserify', () => {
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
  .on('error', console.error)
  .pipe(source('script.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(dest))
})

gulp.task('watch-ts', ['browserify'], () => {
  browserSync.reload()
})

gulp.task('watch-html', ['copyHtml'], () => {
  browserSync.reload()
})

gulp.task('watch-assets', ['copyAssets'], () => {
  browserSync.reload()
})

gulp.task('watchers', ['browser-sync'], () => {
  gulp.watch(sources.pages, ['watch-html'])
  gulp.watch(sources.scripts, ['watch-ts'])
  gulp.watch(sources.styles, ['sass'])
  gulp.watch(sources.assets, ['watch-assets'])
})

gulp.task('default', ['clean-build-folder'], () => {
  gulp.start('watchers')
})

gulp.task('build-tasks', ['browserify', 'copyHtml', 'sass', 'copyAssets'])

gulp.task('optimization-tasks', ['uglifyCss', 'uglyfyJS'])

gulp.task('build-prod', () => {
  runSequence(
    'clean-build-folder',
    'build-tasks',
    'optimization-tasks'
  )
})

gulp.task('uglifyCss', () => {
  return gulp.src(dest + '/*.css')
  .pipe(uglifycss({
    "maxLineLen": 80,
    "uglyComments": true
  }))
  .pipe(gulp.dest(dest))
})

gulp.task('uglyfyJS', () => {
  return gulp.src(dest + '/*.js')
  .pipe(uglify())
  .pipe(gulp.dest(dest))
})