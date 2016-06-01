var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var cssnano = require('gulp-cssnano');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var clean = require('rimraf');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var jshint = require('gulp-jshint');
var jasmine = require('gulp-jasmine');
var removeCode = require('gulp-remove-code');
var babelify = require('babelify');
var babel = require('gulp-babel');
var rsync = require('gulp-rsync');
var runSquence = require('run-sequence');
var template = require('gulp-template');
var fs = require('fs');
var newer = require('gulp-newer');

/**
 * images directory contains src and dist.  src are all unoptimized images; dist are optimized images.  Since some images
 * will go into the media library and some will go into the themeName/images directory - manually move these images where
 * you want them.
 *
 * themeName/js contains a src and dist directory.  dist will contain the optimized and minimized code
 *
 * themeName/*style.scss contains the styles and the comments to let WordPress know the Theme Name.  The theme name 
 * is grabbed from package.json. It is converted to css with the name style.css.  It is not minimized at the moment 
 * since that removes the comments.
 *
 * All js code can be ES6.
 *
 * Any browserify js modules should be called from themeName/js/src/app/app.js. This should be enqueued as a script in
 * functions.php
 *
 * Any basic js code should be put in themeName/js/src/script.js.  If you have multiple scripts (even from vendors),
 * list them in the jsScripts variable below and they will be concatenated and minimized into a single js file in the order
 * they appear in the jsScript array.  This should be enqueued as a script in functions.php
 *
 * Any js code you don't want in the dist production code, you can wrap it like the following example.  Change the 
 * variable 'production' below.
 *     //removeIf(production)
 *      console.log(dVar);
 *     //endRemoveIf(production)
 *
 */

    //variables
var pkg = JSON.parse(fs.readFileSync('./package.json'));
var themeName = pkg.name;
var styleSrc = 'style.scss';
var styleDest = 'style.css';
var production = true;
var jsScripts = ['my_scripts.js'];
var jsScriptsWithPath = jsScripts.map( function (s) {
    return themeName + '/js/src/' + s;
});


//TODO - add gulp-new to imagemin task

/**
 * Cleaning tasks
 */

gulp.task('cleanImages', function(cb) {
    clean('images/dist', cb);
});

gulp.task('cleanScripts', function(cb){
    clean(themeName + '/js/dist', cb);
});

gulp.task('clean', ['cleanImages', 'cleanScripts']);

/**
 * Copying vendor js files - js files you don't want concatenated with others
 *   will need to enqueue them separately in functions.php
 */
gulp.task('vendorjs', function() {
   gulp.src(themeName + '/js/src/vendor/**/*.js')
       .pipe (gulp.dest(themeName + '/js/dist/vendor/'));
});

/**
 *  scripts runs browserify on the primary app file to bundle code into a single file
 *  It uses babelify to convert to ES5. It also strips out any testing code using comment
 *  enclosures left in the modules
 *  Creates a non minified copy and a minified copy
 * */
gulp.task('scripts', function() {
    var b = browserify({
        entries: themeName + '/js/src/app/app.js',
        debug: true
    }).transform(babelify);

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(removeCode({ production: production}))
        .pipe(gulp.dest(themeName + '/js/dist/app'))
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(themeName + '/js/dist/app'));
      //  .pipe(browserSync.stream());
});

/**
 * Any non module based javascript (no requires) so no browserify needed
 * */
gulp.task('other-scripts', function() {
     return gulp.src(jsScriptsWithPath)
         .pipe(concat(jsScriptsName))
        .pipe(babel())
        .pipe(removeCode({ production: production}))
        .pipe(gulp.dest(themeName + '/js/dist'))
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(themeName + '/js/dist'));
 //       .pipe(browserSync.stream());
});


gulp.task('images', function() {
    gulp.src(['images/src/**/*']).
        pipe(newer('images/dist'))
        .pipe(imageMin({
            progressive: true

        }))
        .pipe(gulp.dest('images/dist'));
//        .pipe(browserSync.stream())
});

gulp.task('styles', function() {
    return gulp.src([ themeName + '/' + styleSrc])
        .pipe(sourcemaps.init())
        .pipe(template({pkg: pkg, environment: production}))
        .pipe(postcss([require('precss'), require('postcss-calc')({warnWhenCannotResolve: true}), require('autoprefixer')({ browsers: ['last 2 versions'] })]))
     //   .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(rename( styleDest ))
        .pipe(gulp.dest( themeName ));
     //   .pipe(browserSync.stream());
});

/* setup keys so no login or password is required when run */
/* BE CAREFUL! This config will erase anything on the remote side that is not on the local side.  Make sure you have the right directory! */

var remote = JSON.parse(fs.readFileSync('./rsync.json'));
gulp.task('deploy', function() {
    return gulp.src(themeName + '/**')
        .pipe(rsync({
            hostname: remote.hostname,
  //          destination: '~/public_html/wp-content/themes/' + themeName,
            destination: '~/staging/3/wp-content/themes/' + themeName,
            root: themeName,
            username: remote.username,
            port: remote.port,
            incremental: true,
            progress: true,
            recursive: true,
            clean: true

        }))

});
/**
 *  This task copies all other files like css or images needed by js scripts, usually vendor js
 */
gulp.task('script-assets', function(){
   return gulp.src([themeName + '/js/src/**/*', '!' + themeName + '/js/src/**/*.js'])
       .pipe(gulp.dest( themeName + '/js/dist/'));
});


gulp.task('deploy-scripts', function(done) {
    runSquence('scripts', 'deploy', function() { done(); });
});

gulp.task('deploy-other-scripts', function(done) {
    runSquence('other-scripts', 'script-assets', 'deploy', function() { done(); });
});

gulp.task('deploy-styles', function(done) {
    runSquence('styles', 'deploy', function() { done(); });
});

gulp.task('default', ['deploy-styles',  'images', 'deploy-other-scripts'], function() {
    //browserSync.init({
    //    server: './'
    //});
    //gulp.watch('src/**/*', browserSync.reload);
  //  gulp.watch('src/styles/**/*.css', ['styles']);
   gulp.watch(themeName + '/' + styleSrc, ['deploy-styles']);
   gulp.watch(themeName +'/js/src/*.js', ['deploy-other-scripts']);
    gulp.watch(themeName + '/js/src/vendor/**/*.js', ['vendorjs']);
    gulp.watch(themeName + '/**/*.php', ['deploy']);
    gulp.watch(themeName + '/js/src/app/**/*.js', ['deploy-scripts']);
    gulp.watch('src/scripts/tests/**/*.js', ['unitTest']);
   // gulp.watch('src/scripts/*.js', ['other-scripts']);
    gulp.watch('src/images/**.*', ['images']);
   // gulp.watch('*.html', browserSync.reload);
});



/**
 * next three tasks: Creates a unit testing environment after converting all src js files from ES6 to ES5
 * Then it runs gulp-jasmine on the test scripts.  
 * */

gulp.task('cleanBuild', function(cb) {
    clean(themeName +'/js/build', cb);
});

gulp.task('unitTest-Assets', ['cleanBuild'],function(){
   return gulp.src([themeName + '/js/src/tests/**/*', '!'+themeName+'/js/src/tests/*.js'])
       .pipe(gulp.dest(themeName + '/js/build/tests/')); 
});

gulp.task('buildTestFolder',['unitTest-Assets'], function() {
    return gulp.src(themeName +'/js/src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({ 'presets' : ['es2015']}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(themeName +'/js/build/'));

});

gulp.task('unitTest', ['buildTestFolder'], function() {
    return gulp.src(themeName +'/js/build/tests/**/*.js')
        .pipe(jasmine());
});

/**
 * lint can be used on non ES6 javascript
 * */

gulp.task('lint', function() {
    gulp.src('src/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


