var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var clean = require('rimraf');
var removeCode = require('gulp-remove-code');
var babel = require('gulp-babel');
var rsync = require('gulp-rsync');
var runSequence = require('run-sequence');
var template = require('gulp-template');
var fs = require('fs');
var newer = require('gulp-newer');
var cleanCss = require('gulp-clean-css');
var sorting = require('postcss-sorting');

/**

 * themeName/js contains a src and dist directory.  dist will contain the optimized and minimized code
 *
 * themeName/*style.scss contains the styles and the comments to let WordPress know the Theme Name.  The theme name 
 * is grabbed from package.json. It is converted to css with the name style.css. 
 *
 * All custom js code can be ES6.

 *
 * Any js code you don't want in the dist production code, you can wrap it like the following example.  Change the 
 * variable 'production' below.
 *     //removeIf(production)
 *      console.log(dVar);
 *     //endRemoveIf(production)
 *
 */

    //variables
var pkg = require('./package.json');
var themeName = pkg.name;

var production = true;
var jsConcatenated = 'scripts.js';
// All scripts listed in this array will be concatenated into a single js file with the name from jsConcatenated.
// Be sure to enqueue the jsConcatenated file in the functions.php file
var jsScripts = ['my_scripts.js'];

//Create a variable containing all scripts with path 
var jsScriptsWithPath = jsScripts.map( function (s) {
    return themeName + '/js/src/' + s;
});
//Create a variable containing all scripts with path with a negated ! in front for tasks we want to have these scripts excluded
var negatedJsScriptsWithPath = jsScripts.map( function (s) {
    return '!' + themeName + '/js/src/' + s;
});
console.log(negatedJsScriptsWithPath);
//Create 

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
 * Copying vendor or separate js files - js files you don't want concatenated with others
 *   will need to enqueue them separately in functions.php.  If you want a vendor or other js file concatenated, place 
 *   the js file name in the jsScripts array above in the order it should be concatenated.
 */
gulp.task('vendorjs', function() {
    var scripts = negatedJsScriptsWithPath.concat([themeName + '/js/src/**/*.js']);
     return gulp.src(scripts)  //include all js under src except for js to be concatenated
       .pipe(sourcemaps.init({loadMaps: true}))
       .pipe(uglify())
       .pipe(rename({extname: '.min.js'}))
       .pipe(sourcemaps.write('.'))
       .pipe (gulp.dest(themeName + '/js/dist/'));
});


/**
 * Any non module based javascript (no requires) so no browserify needed
 * */
gulp.task('other-scripts', function() {
     return gulp.src(jsScriptsWithPath)
         .pipe(concat(jsConcatenated))
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

/**
 *  This task copies all other files like css or images needed by js scripts, usually vendor js
 */
gulp.task('script-assets', function(){
    return gulp.src([themeName + '/js/src/**/*', '!' + themeName + '/js/src/**/*.js'])
        .pipe(gulp.dest( themeName + '/js/dist/'));
});
/* 
'images' looks in the images/src directory which is not in the same tree as the themename.  It creates optimized images
in the /images/dist directory.  These can be manually moved to the themename/images folder or uploaded to the wordpress
site if the image is not theme specific.
 */

gulp.task('images', function() {
    gulp.src(['images/src/**/*']).
        pipe(newer('images/dist'))
        .pipe(imageMin({
            progressive: true

        }))
        .pipe(gulp.dest('images/dist'));
//        .pipe(browserSync.stream())
});

/*  Styles
--------------------------------------------------------------------------------
 */
gulp.task('sortScss', function() {
    var scssSortingConfig = JSON.parse(fs.readFileSync('./.scssSorting'));
   return gulp.src([ themeName + '/**/*.scss'])
       .pipe(postcss([sorting(scssSortingConfig)]))
       .pipe(gulp.dest(themeName));
});

gulp.task('styles', function() {
    return gulp.src([ themeName + '/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(template({pkg: pkg, environment: production}))
        .pipe(postcss([require('precss'), require('postcss-calc')({warnWhenCannotResolve: true}), require('autoprefixer')({ browsers: ['last 2 versions'] })]))
        .pipe(cleanCss())
        .pipe(rename(function(path){
            path.extname = '.css'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest( themeName ));
     //   .pipe(browserSync.stream());
});

/* setup keys so no login or password is required when run */
/* BE CAREFUL! This config will erase anything on the remote side that is not on the local side.  Make sure you have the right directory! */


var remote = require('./rsync.json');
gulp.task('deploy', function() {
    return gulp.src(themeName + '/**')
        .pipe(rsync({
            hostname: remote.hostname,
  //          destination: '~/public_html/wp-content/themes/' + themeName,
            destination: '~/staging/6/wp-content/themes/' + themeName,
            root: themeName,
            username: remote.username,
            port: remote.port,
            incremental: true,
            progress: true,
            recursive: true,
            clean: true

        }))

});


/* when certain files change - these tasks make sure they are run in sequence */


gulp.task('deploy-other-scripts', function(done) {
    runSequence('other-scripts', 'script-assets', 'vendorjs', 'deploy', function() { done(); });
});

gulp.task('deploy-styles', function(done) {
    runSequence('sortScss','styles', 'deploy', function() { done(); });
});

gulp.task('clean-build', function(done) {
    runSequence('other-scripts', 'script-assets', 'vendorjs', 'sortScss','styles', 'deploy', function() { done(); });
});

gulp.task('default', ['deploy-styles',  'images', 'deploy-other-scripts'], function() {
    gulp.watch(themeName + '/**/*.scss', ['deploy-styles']);
    gulp.watch(themeName +'/js/src/**/*.*', ['deploy-other-scripts']);
    gulp.watch(themeName + '/**/*.php', ['deploy']);
    gulp.watch('src/images/**.*', ['images']);
});



/*
var now = new Date(),
    year = now.getUTCFullYear(),
    month = now.getMonth() + 1,
    day = now.getDate(),
    hour = now.getHours(),
    minutes = now.getMinutes();
month = month < 10 ? '0' + month : month;
day = day < 10 ? '0' + day : day;
hour = hour < 10 ? '0' + hour : hour;
minutes = minutes < 10 ? '0' + minutes : minutes;
nowString = year + '-' + month + '-' + day + ' at ' + hour + ':' + minutes; 
*/