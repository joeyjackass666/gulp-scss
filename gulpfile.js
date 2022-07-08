let project_folder = require("path").basename(__dirname);
let source_folder = "#src";

let path={
    build:{
        html: project_folder+"/",
        css: project_folder+"/css/",
        js: project_folder+"/js/",
        img: project_folder+"/img/",
        fonts: project_folder+"/fonts/",
    },
    src:{
        html: [source_folder+"/*.html", "!"+source_folder+"/_*.html"],
        css: source_folder+"/scss/style.scss",
        js: source_folder+"/js/script.js",
        img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder+"/fonts/*.ttf",
    },
    watch:{
        html: source_folder+"/**/*.html",
        css: source_folder+"/scss/**/*.scss",
        js: source_folder+"/js/**/*.js",
        img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}" 
    },
    clean: "./" + project_folder + "/"
};

let { src, dest } = require('gulp');
const imagemin = require('gulp-imagemin'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    webp = require("gulp-webp"),
    webphtml = require("gulp-webp-html"),
    webpcss = require("gulp-webpcss"),
    autoprefixer = require('gulp-autoprefixer'),
    scss = require('gulp-sass')(require('sass'));

    



function browserSync(params) {
    browsersync.init({
      server:{
        baseDir: "./" + project_folder + "/"
      },
      port:3000,
      notify:false 
    });
} 

function html () {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css)
    .pipe
        (scss({
            outputStyle: "expanded"
        }))
    .pipe(
        group_media()
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
        rename ({
            extname: ".min.css"
        })
    )
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        cascade: true
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename ({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.img)
    .pipe(
        webp ({
            quality: 70
        })
    )
    
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imagemin(
        [
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]
    ))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}





function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(images, js, css, html));
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.images = images;
exports.watch = watch;
exports.default = watch;
exports.build = build;
exports.html = html;
exports.css = css;
exports.js = js;



