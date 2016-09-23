const gulp         = require('gulp');
const babel        = require('gulp-babel');
const hb           = require('gulp-hb');
const rename       = require('gulp-rename');
const del          = require('del');
const sass         = require('gulp-sass');
const sourcemaps   = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync  = require('browser-sync');
const data         = require('gulp-data');
const frontMatter  = require('gulp-front-matter');
const prettyUrl    = require("gulp-pretty-url");

srcPaths = {
  stylesheets: './src/stylesheets/*.scss',
  scripts: './src/scripts/*.js',
  templates: './src/{,projects/}*.hbs',
  public: './src/public/*',
  hbs: {
    partials: './src/assets/partials/*.hbs',
    helpers: './src/assets/helpers/*.js',
    data: './src/assets/hbdata/**/*.{js,json}'
  }
}

buildPaths = {
  root: './build',
  stylesheets: './build/stylesheets',
  scripts: './build/scripts',
  templates: './build',
  public: './build/public'
}

defaultTasks = [
  'build',
  'browser-sync'
]

gulp.task('default', defaultTasks, () => {});

buildTasks = [
  'templates',
  'stylesheets',
  'scripts',
  'public'
];

gulp.task('build', buildTasks, () => {});

// Empty out the 'build' directory
gulp.task('clean', () => {
  return del([buildPaths.root]);
});

gulp.task('public', () => {
  gulp
    .src(srcPaths.public)
    .pipe(gulp.dest(buildPaths.public));
});

// Build HTML from Handlebars templates
var hbData;

function addGlobalDataFromFile(data) {
  if (data.frontMatter.collection) {
    hbData[data.frontMatter.collection] = hbData[data.frontMatter.collection] || [];
    hbData[data.frontMatter.collection].push(data);
  }
}

gulp.task('refreshData', () => {
  hbData = {};

  return gulp
    .src(srcPaths.templates)
    .pipe(frontMatter({remove: false})
      .on('data', file => {
        addGlobalDataFromFile(file);
      }));
})

gulp.task('templates', ['refreshData'], () => {
  var hbStream = hb()
    .partials(srcPaths.hbs.partials)
    .helpers(require('handlebars-layouts'))
    .helpers('./assets/helpers/*.js')
    .helpers(srcPaths.hbs.helpers)
    .data(srcPaths.hbs.data)
    .data(hbData)

  return gulp
    .src(srcPaths.templates)
    .pipe(data((file) => {
      return require(file.path.replace('.html', '.json'));
    }))
    .pipe(frontMatter())
    .pipe(hbStream)
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(prettyUrl())
    .pipe(gulp.dest(buildPaths.templates));
})

// Compile and autoprefix SASS files
var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

gulp.task('stylesheets', function () {
  return gulp
    .src(srcPaths.stylesheets)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(buildPaths.stylesheets))
    .pipe(browserSync.stream())
    .resume();
});

  // Gulp SASS prod example
    // gulp.task('prod', ['sassdoc'], function () {
    //   return gulp
    //     .src(input)
    //     .pipe(sass({ outputStyle: 'compressed' }))
    //     .pipe(autoprefixer(autoprefixerOptions))
    //     .pipe(gulp.dest(output));
    // });

// Compile Javascript files
gulp.task('scripts', () => {
  return gulp
    .src(srcPaths.scripts)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(buildPaths.scripts))
});

// BrowserSync
syncTasks = [
  'stylesheets-watch',
  // 'templates-watch',
  // 'scripts-watch'
]

gulp.task('browser-sync', syncTasks, () => {
  browserSync.init({
    server: {
      baseDir: buildPaths.root
    }
  })

  gulp.watch([srcPaths.templates, srcPaths.hbs.partials, srcPaths.hbs.helpers, srcPaths.hbs.data], ['templates-watch']);
  gulp.watch(srcPaths.scripts, ['scripts-watch']);
  gulp.watch(srcPaths.stylesheets, ['stylesheets-watch']);
});

gulp.task('stylesheets-watch', ['stylesheets'], (done) => {
  // browserSync.reload();
  done();
});

gulp.task('templates-watch', ['templates'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('scripts-watch', ['scripts'], function(done) {
  browserSync.reload();
  done();
});
