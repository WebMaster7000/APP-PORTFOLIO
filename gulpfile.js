"use strict"

//Path
const sourceFolder = "_src";
const distFolder = "dist";


const pathBuild = {
  html: distFolder + "/",
  css: distFolder + "/css/",
  js: distFolder + "/js/",
  img: distFolder + "/img/",
  fonts: distFolder + "/fonts/",
};

const pathSource = {
  html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
  css: sourceFolder + "/scss/style.scss",
  js: sourceFolder + "/js/**/*.js",
  img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  fonts: sourceFolder + "/fonts/*.ttf",
};

const pathWatch = {
  html: sourceFolder + "/**/*.html",
  css: sourceFolder + "/scss/**/*.scss",
  js: sourceFolder + "/js/**/*.js",
  img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
};

const pathClean = "./" + distFolder + "/"


//Gulp settings
const { src, dest, parallel, series, watch } = pkg;
import pkg from 'gulp';
//Local server
import browsersync from 'browser-sync';
//Plugins
import fileinclude from 'gulp-file-include';
import del from 'del';
import scss from 'gulp-dart-sass';
import autoprefixer from 'gulp-autoprefixer';
import gulpcleancss from 'gulp-clean-css';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import minify from 'gulp-minify';
import babel from 'gulp-babel';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import webphtml from 'gulp-webp-html';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import fonter from 'gulp-fonter';


//server
const browserSync = (params) => {
  browsersync.init({
    server: {
      baseDir: "./" + distFolder + "/"
    },
    port: 3000,
    notify: false
  })
};

//tasks in the stream
export const html = (params) => {
  return src(pathSource.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(pathBuild.html))
};

export const css = (params) => {
  return src(pathSource.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(
      autoprefixer({
        cascade: true
      })
    )
    .pipe(dest(pathBuild.css))
    .pipe(gulpcleancss())
    .pipe(
      rename({
        extname: "-min.css"
      })
    )
    .pipe(dest(pathBuild.css))
};

export const js = () => {
  return src(pathSource.js)
    .pipe(concat('script.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(pathBuild.js))
    .pipe(minify())
    .pipe(dest(pathBuild.js))
};

export const images = () => {
  return src(pathSource.img)
    .pipe(imagemin())
    .pipe(dest(pathBuild.img))
    .pipe(src(pathSource.img))
    .pipe(imagemin())
    .pipe(webp())
    .pipe(dest(pathBuild.img))
}

export const fonts = () => {
  return src(pathSource.fonts)
    .pipe(ttf2woff())
    .pipe(dest(pathBuild.fonts))
    .pipe(src(pathSource.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(pathBuild.fonts))
}

//tasks selectively 

//otf => ttf
export const otf2ttf = () => {
  return src([sourceFolder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(sourceFolder + '/fonts/'));
}


//deleting dist
export const clean = (params) => {
  return del(pathClean);
};

//watching files
const watcher = (params) => {
  watch([pathWatch.html], html).on('change', browsersync.reload);
  watch([pathWatch.css], css).on('change', browsersync.reload);
  watch([pathWatch.js, '!src/js/**/*.min.js'], js).on('change', browsersync.reload);
  watch([pathWatch.img], images);
};

//task manager
export default series(
  clean,
  parallel(html, css, js, images, fonts),
  parallel(browserSync, watcher),
);

//!to call specific task:  npm install @babel/core @babel/register --save-dev
//!                        export before task