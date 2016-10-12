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
const prettyUrl    = require('gulp-pretty-url');
const imageResize  = require('gulp-image-resize');
const parallel     = require('concurrent-transform');
const gm           = require('gulp-gm');

srcPaths = {
  stylesheets: './src/stylesheets/*.scss',
  scripts: './src/scripts/*.js',
  templates: './src/{,projects/}*.hbs',
  public: './src/public/*',
  pngs: './src/public/images/*.png',
  imagesRoot: './src/public/images/',
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
  'stylesheets',
  'scripts',
  'templates'
];

gulp.task('build', buildTasks, () => {});

// Empty out the 'build' directory
gulp.task('clean', () => {
  return del([buildPaths.root]);
});

publicTasks = [
  'convert-png'
]

pngData = {};

gulp.task('public', publicTasks, () => {
});

function getImageFilenameFromGmfile(gmfile) {
  return gmfile.source.split('/').pop()
}

gulp.task('get-data-png', () => {
  return gulp
    .src(srcPaths.pngs)
    .pipe(gm((gmfile) => {
      filename = getImageFilenameFromGmfile(gmfile)
      gmfile.size((err, size) => {
        pngData[filename] = size;
      });
      return gmfile;
    }))
});


gulp.task('templates', ['convert-png', 'hb-templates'], () => {
  return gulp;
});

gulp.task('convert-png', ['get-data-png', 'hb-templates'], () => {
  conversions = Object.keys(pngData)
    .filter((filename) => {
      return pngData[filename].gm;
    })
    .map((filename) => {
      return Object.keys(pngData[filename].gm).map((newFilename) =>{
        return pngData[filename].gm[newFilename];
      });
    });
  conversions = [].concat.apply([], conversions);
  console.log(conversions);

  conversions.forEach((conversion) => {
    gulp
      .src(srcPaths.imagesRoot + conversion.filename)
      .pipe(rename({
        basename: conversion.newFilename.split('.')[0]
      }))
      .pipe(gm((gmfile) => {
        if (conversion.conversion == 'resize') {
          console.log(conversion.params.width, conversion.params.height);
          return gmfile.resize(conversion.params.width, conversion.params.height);
        }
      }))
      .pipe(gulp.dest(buildPaths.public));

  });

  gulp
    .src(srcPaths.pngs)
    .pipe(gm((gmfile) => {
      return gmfile;
    }))
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

gulp.task('get-data-frontmatter', () => {
  hbData = {};

  return gulp
    .src(srcPaths.templates)
    .pipe(frontMatter({remove: false})
      .on('data', file => {
        addGlobalDataFromFile(file);
      }));
})

gulp.task('hb-templates', ['get-data-frontmatter', 'get-data-png'], () => {
  var hbStream = hb()
    .partials(srcPaths.hbs.partials)
    .helpers(require('handlebars-layouts'))
    .helpers('./assets/helpers/*.js')
    .helpers(srcPaths.hbs.helpers)
    .data(srcPaths.hbs.data)
    .data(hbData)
    .data({image:pngData, gulp:gulp})

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
syncTasks = ['build']

gulp.task('browser-sync', syncTasks, () => {
  browserSync.init({
    server: {
      baseDir: buildPaths.root
    }
  })

  gulp.watch([srcPaths.templates, srcPaths.hbs.partials, srcPaths.hbs.helpers, srcPaths.hbs.data], ['templates-watch']);
  gulp.watch(srcPaths.scripts, ['scripts-watch']);
});

gulp.task('templates-watch', ['templates'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('scripts-watch', ['scripts'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('deploy', function(done) {
  console.log("Deploying to s3...")
  var exec = require('child_process').exec;
  var cmd = 's3-website deploy build/';

  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log(error)
      done()
    } else {
      console.log(stdout);
      console.log(stderr);
      console.log('Deployed to s3 successfully.')
      done()
    }
  });
  // Could add this to .s3-website.json:
  // "gzipTypes":"text\/html|text\/css|application\/javascript"
});