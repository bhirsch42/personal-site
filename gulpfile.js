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
const fs           = require('fs');
const cloudfront   = require('gulp-cloudfront-invalidate');
const highlight    = require('gulp-highlight');

srcPaths = {
  stylesheets: './src/stylesheets/*.scss',
  scripts: './src/scripts/*.js',
  templates: './src/{,projects/}*.hbs',
  public: './src/public/*',
  pngs: './src/public/images/*.png',
  imagesRoot: './src/public/images/',
  static: './src/public/static/*',
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
  'templates',
  'public'
];

gulp.task('build', buildTasks, () => {});

// Empty out the 'build' directory
gulp.task('clean', () => {
  return del([buildPaths.root]);
});

pngData = {};

gulp.task('public', () => {
  gulp
    .src(srcPaths.static)
    .pipe(gulp.dest(buildPaths.public));
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

  conversions.forEach((conversion) => {
    gulp
      .src(srcPaths.imagesRoot + conversion.filename)
      .pipe(rename({
        basename: conversion.newFilename.split('.')[0]
      }))
      .pipe(gm((gmfile) => {
        if (conversion.conversion == 'resize') {
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
    .pipe(highlight())
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
    .pipe(browserSync.reload({stream: true}))
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
  gulp.watch(srcPaths.stylesheets, ['stylesheets']);

});

gulp.task('templates-watch', ['templates'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('scripts-watch', ['scripts'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('stylesheets-watch', (done) => {
  done()
});

deployTasks = [
  'cloudfront-invalidate',
  'upload-files'
]

gulp.task('deploy', deployTasks, (done) => { done() });

gulp.task('cloudfront-invalidate', ['upload-files'],(done) => {
  fs.readFile('.env', 'utf8', (err, data) => {
    settings = data.split('\n')
    AWS_ACCESS_KEY_ID = settings[0].split('=')[1]
    AWS_SECRET_ACCESS_KEY = settings[1].split('=')[1]

    settings = {
      distribution: 'E2OR9UAQ451IGU',
      paths: ['/*'],
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      wait: false
    }

    return gulp
      .src('*')
      .pipe(cloudfront(settings));

  })
});

gulp.task('upload-files', ['build'], function(done) {
  var exec = require('child_process').exec;
  var cmd = 's3-website deploy build/';

  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      done()
    } else {
      done()
    }
  });
  // Could add this to .s3-website.json:
  // "gzipTypes":"text\/html|text\/css|application\/javascript"
});