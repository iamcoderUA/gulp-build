const gulp = require('gulp');
const webpackStream = require('webpack-stream');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const del = require('del');

const autoprefixer = require('gulp-autoprefixer');
const cheerio = require('gulp-cheerio');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const normalize = require('node-normalize-scss');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const svgSprite = require('gulp-svg-sprites');
const svgmin = require('gulp-svgmin');
const uglify = require('gulp-uglify');

const paths = {
  root: './prod',

  html: {
    src: 'src/*.html',
    dest: 'prod/',
  },
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'prod/css/',
  },
  scripts: {
    src: 'src/js/*.js',
    dest: 'prod/js/',
  },
  images: {
    src: 'src/img/{bg,content,icons}/**/*',
    dest: 'prod/img/',
  },
};

//  SVG
function sprites() {
  return gulp.src('src/img/svg/*.svg')
    .pipe(plumber())
    .pipe(svgmin({
      js2svg: {
        pretty: true,
      },
    }))
    .pipe(cheerio({
      run($) {
        $('[fill]').removeAttr('fill');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: false },
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: 'symbols',
      preview: false,
    }))
    .pipe(gulp.dest('src/img/'))
    .pipe(rename({
      basename: 'sprite',
      suffix: '.min',
    }))
    .pipe(notify('Create sprite svg success'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('prod/img/'));
}

// Development
function templates() {
  return gulp.src(paths.html.src)
    .pipe(plumber())
    .pipe(notify('Template success'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.html.dest));
}

function scss() {
  return gulp.src('src/scss/main.scss')
    .pipe(plumber())
    .pipe(sass({ includePaths: normalize.includePaths }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.init())
    .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(notify('Style success'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(plumber())
    .pipe(webpackStream({
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
              presets: ['env'],
            },
          },
        ],
      },
    }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(notify('Scripts success'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.scripts.dest));
}
/* uncomment when using js plugins
function plugins() {
  return gulp.src([

  ])
    .pipe(plumber())
    .pipe(concat('plugins.min.js'))
    .pipe(notify('Plugins success'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.scripts.dest));
}

function pluginStyles() {
  return gulp.src([

  ])
    .pipe(plumber())
    .pipe(concat('plugins.min.css'))
    .pipe(notify('pluginStyles success'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.styles.dest));
}
*/
function imgMin() {
  return gulp.src(paths.images.src)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(notify('Image success'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.images.dest));
}

function clean() {
  return del(paths.root);
}

function watch() {
  gulp.watch(paths.html.src, templates);
  gulp.watch(paths.styles.src, scss);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, imgMin);
}

function server() {
  browserSync.init({
    server: paths.root,
  });
  browserSync.watch(`${paths.root}/**/*.*`, browserSync.reload);
}

// Exports
exports.templates = templates;
exports.scss = scss;
exports.scripts = scripts;
// exports.plugins = plugins;           // uncomment when using js plugins
// exports.pluginStyles = pluginStyles; // uncomment when you need css files of  plugins
exports.sprites = sprites;
exports.imgMin = imgMin;
exports.clean = clean;
exports.watch = watch;

// Tasks
gulp.task('build', gulp.series(
  clean,
  gulp.parallel(templates, scss, scripts, sprites, imgMin),
));

gulp.task('default', gulp.series(
  gulp.parallel(templates, scss, scripts),
  gulp.parallel(watch, server),
));
