var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();


var config = {
    src: 'source/',
    temp: '.temp/',
    dist: 'dist/'
};

// 源文件路径配置
var source_path = {
    html: config.src + '{,**/}*.html',
    js:   config.src + 'js/{,**/}*.js',
    scss: config.src + 'scss/{,**/}*.scss',
    img:  config.src + 'images/{,**/}*.{png,jpg,gif,webp}',
    scss_path : config.src + 'scss'
};

// 目标文件配置
var dist_path = {
    html: config.dist,
    js:   config.dist + 'js',
    css: config.dist + 'css',
    img:  config.dist + 'images'
};

// 清除目标文件夹里的文件保证目标文件干净
gulp.task('clean', function() {  
  return gulp.src([ 'dist' ], {read: false})
             .pipe(plugins.clean());
});


// 复制html代码
gulp.task('copy-html', function() {
    return gulp.src( source_path.html )
               .pipe(gulp.dest( dist_path.html ))
               .pipe(plugins.connect.reload());
});

// compass编译代码
gulp.task('compass', function() {
    return gulp.src( source_path.scss )
               .pipe(
                    plugins.compass({
                      style: 'expanded',              
                      css: dist_path.css,            
                      sass: source_path.scss_path    
               }))
               .pipe(gulp.dest( dist_path.css ))
               .pipe(plugins.rename({suffix: '.min'}))
               .pipe(plugins.minifyCss())
               .pipe(gulp.dest( dist_path.css ))
               .pipe(plugins.connect.reload());
});

//图片最小化处理
gulp.task('min-images', function() {
    return gulp.src( source_path.img )
               //.pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))   // cache的作用快取保存已经压缩过的图片，以便每次进行此任务时不需要再重新压缩。！！！这里使用后文件位置发生错乱现象
               .pipe(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
               .pipe(gulp.dest( dist_path.img ))
               .pipe(plugins.connect.reload());
});

// js 压缩
gulp.task('min-js', function() {
    return gulp.src( source_path.js )
               .pipe(plugins.rename({suffix: '.min'}))
               .pipe(plugins.uglify())
               .pipe(gulp.dest( dist_path.js ))
               .pipe(plugins.connect.reload());
});

//js 语法检查
gulp.task('jshint', function () {
    return gulp.src( source_path.js )
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});


// connect开启服务器
gulp.task('server', function() {
    plugins.connect.server({root: 'dist',livereload: true});
});

// 监控
gulp.task('watch', function() {
    gulp.watch( source_path.html, ['copy-html']);
    gulp.watch( source_path.scss, ['compass']);
    gulp.watch( source_path.img,  ['min-images']);
    gulp.watch( source_path.js,   ['min-js']);
});

// 实时刷新
gulp.task('default', ['server','watch']);

// 初始化清空dist
gulp.task('pro-init', ['clean'], function() {  
    gulp.start('copy-html', 'compass', 'min-images', 'min-js');
});