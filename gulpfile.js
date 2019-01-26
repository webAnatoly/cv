'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulpIf = require('gulp-if');
// const debug = require('gulp-debug');
const notify = require('gulp-notify');
const multipipe = require('multipipe');
const pug = require('gulp-pug');
const pump = require('pump');
const minify = require('gulp-minify');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'; // NODE_ENV=production gulp build

gulp.task('styles', () => {
  let plugins;
  if (isDevelopment) {
    plugins = [autoprefixer({ browsers: ['last 5 version'] })];
  } else {
    plugins = [
      autoprefixer({ browsers: ['last 5 version'] }),
      cssnano
    ];
  }
  return multipipe(
    gulp.src('frontend/scss/main.scss'),
    gulpIf(isDevelopment, sourcemaps.init()),
    sass(),
    postcss(plugins),
    gulpIf(isDevelopment, sourcemaps.write()),
    gulp.dest('public/css')
  ).on('error', notify.onError());
});

gulp.task('clean', function () {
  return del('public');
});

gulp.task('assets', function () {
  return gulp.src('frontend/img/**/*.*', { since: gulp.lastRun('assets') })
    .pipe(gulp.dest('public/img'));
});

gulp.task('fonts', function () {
  return gulp.src('frontend/fonts/**/*.*', { since: gulp.lastRun('fonts') })
    .pipe(gulp.dest('public/fonts'));
});

gulp.task('favicons', function () {
  return gulp.src('frontend/*.*', { since: gulp.lastRun('favicons'), nodir: true })
    .pipe(gulp.dest('public'));
});

gulp.task('pug', function () {
  return gulp.src('frontend/pug/pages/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('js', function (cb) {
  pump([
    gulp.src('frontend/js/**/*.js'),
    minify(),
    gulp.dest('public/js')
  ],
  cb);
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('styles', 'assets', 'pug', 'js', 'favicons', 'fonts'))
);

gulp.task('watch', () => {
  gulp.watch('frontend/scss/**/*.*', gulp.series('styles'));
  gulp.watch('frontend/img/**/*.*', gulp.series('assets'));
  gulp.watch('frontend/pug/**/*.*', gulp.series('pug'));
  gulp.watch('frontend/js/**/*.js', gulp.series('js'));
  gulp.watch('frontend/js/**/*.js', gulp.series('fonts'));
});

gulp.task('serve', () => {
  browserSync.init({
    server: 'public'
  });

  browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev',
  gulp.series('build', gulp.parallel('watch', 'serve'))
);
