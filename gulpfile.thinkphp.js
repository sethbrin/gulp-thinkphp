// generated on 2015-11-03 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var config = {
  app: "./develop/Home/",
  tmp: '.tmp/',
  dest: "production/Public/Home/",
  templateDest: "production/Application/Home/View/",
  homeSrcDir: "__PUBLIC__/Home/"
};

gulp.task('styles', () => {
  gulp.src(config.app + 'Public/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(config.tmp + '/styles'))
    .pipe(reload({stream: true}));
    // simple copy the styles to the tmp
  gulp.src(config.app + 'Public/styles/**/*.css')
    .pipe(gulp.dest(config.tmp + '/styles'));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src(config.app + 'Public/images/icons/*.png').pipe($.spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css',
    imgPath: '../images/sprite.png'
  }));
  spriteData.css.pipe(gulp.dest(config.tmp + 'styles/'));
  spriteData.img.pipe(gulp.dest(config.tmp + 'images/'));
});

gulp.task('scripts', () => {
  return gulp.src([config.app + 'Public/scripts/**/*'])
    .pipe(gulp.dest(config.tmp + 'scripts/'));
});

gulp.task('html', ['styles','scripts'], () => {
  const assets = $.useref.assets({searchPath: [config.tmp, config.app, '.']});

  return gulp.src(config.app + '**/*.tpl')
    .pipe(assets)
    //.pipe($.if('*.js', $.uglify()))
    //.pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(assets.restore())
    .pipe($.useref())
    //.pipe($.if('*.tpl', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest(config.tmp));
});

gulp.task('revision', ['html', 'images'], () => {
  return gulp.src([config.tmp + '**/*.js', config.tmp + '**/*.css',
                  config.tmp + '**/*.jpg', config.tmp + '**/*.png'
                  ])
    .pipe($.rev())
    .pipe(gulp.dest(config.dest))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('.'))
});

gulp.task("revreplaceStatic", ["revision"], function(){
  var manifest = gulp.src("./rev-manifest.json");

  gulp.src([config.dest + "/**/*.css", config.tmp + "/**/*.js", config.app + "/Public/**/*.html"])
    .pipe($.revReplace({manifest: manifest}))
    .pipe(gulp.dest(config.dest));

});

gulp.task("revreplace", ["revreplaceStatic"], function(){
  var manifest = gulp.src("./rev-manifest.json");
  return gulp.src(config.tmp + "/View/**/*.tpl")
    //.pipe($.revReplace({manifest: manifest, replaceInExtensions: ['.js', '.css', '.html', '.tpl']}))
    .pipe($.revReplace({manifest: manifest, replaceInExtensions:['.tpl']}))
    .pipe(gulp.dest(config.templateDest));

});

gulp.task('images', ['sprite'],() => {
  return gulp.src([config.app + '/Public/images/**/*.jpg',
                  config.app + '/Public/images/**/*.png' ,
                  '!' + config.app + 'images/icons'])
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(config.tmp + 'images'));
});

gulp.task('clean', del.bind(null, [config.tmp, config.dest, config.templateDest]));

gulp.task('serve', ['revreplace'], () => {
  var connectPhp = require("gulp-connect-php");
  connectPhp.server({port:8080, hostname:'127.0.0.1'}, ()=>{
    browserSync({
      proxy: '127.0.0.1:8080'
    });
  });
  gulp.watch(config.app + '/**/*.scss', ['build']);
  gulp.watch(config.app + '/**/*.tpl', ['build']);

  gulp.watch([
    config.app + '**/*.tpl',
    config.app + '/**/*.js',
    config.app + '/**/*scss',
  ]).on('change', reload);

});

gulp.task('watch', function() {
  gulp.watch(config.app + '/**/*.scss', ['build']);
  gulp.watch(config.app + '/**/*.tpl', ['build']);

  gulp.watch([
    config.app + '**/*.tpl',
    config.app + '/**/*.js',
    config.app + '/**/*scss',
  ]).on('change', reload);

});

gulp.task('serve:dist',['clean'], ()=> {
  gulp.start('serve');
});


// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['revreplace'], () => {
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
