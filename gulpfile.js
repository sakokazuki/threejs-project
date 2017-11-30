const gulp = require("gulp");
const browserSync = require("browser-sync").create()
const plumber     = require("gulp-plumber")
const runSequence = require('run-sequence')
const fs = require("fs")
const path = require("path");

/*------------------------------------------
env variables
------------------------------------------*/
const envfile = require("./env.js")
let isBuild;
let dist;
let variables;
let buildPath;
switch(process.env.NODE_ENV){
  case "release":
    variables = envfile.release;
    isBuild = true;
    buildPath = "./build_release/";
    break;
  case "stg":
    variables = envfile.stg;
    isBuild = true;
    buildPath = "./build_stg/";
    break;
  case "dev":
  default:
    variables = envfile.dev;
    isBuild = false;
    buildPath = "./build/";
  break;
}
console.log(variables);
console.log(process.env.NODE_ENV);
const sourcePath = "./app/";
const jsPath = buildPath+"js/";
const htmlPath = buildPath;
const cssPath = buildPath+"styles/";
const imageSpriteDir =  ["img/sp/sp-sprite", "img/pc-sprite"];

/*------------------------------------------
gulp tasks
------------------------------------------*/

//----------------
//  dafault & Build
//----------------

gulp.task('default', (cb)=> {
  return runSequence(
    'sprite',
    'copy',
    'webpack',
    'stylus',
    'pug',
    'browser-sync',
    'watch',
    cb
  );
});

gulp.task('build', (cb)=> {
  return runSequence(
    'clean',
    'sprite',
    'copy',
    'webpack',
    'stylus',
    'pug',
    'minify',
    'imagemin',
    cb
  );
});

gulp.task("test", ()=>{
  console.log("test");
})

//----------------
//  Watch
//----------------
gulp.task("watch", ()=>{
  const watch = require("gulp-watch");
  gulp.watch(sourcePath+"**/*.pug",["pug"])
  gulp.watch(sourcePath+"**/*.styl", ["stylus"])

  watch(sourcePath+"assets/**/*", (event)=>{
    gulp.start("copy");
  });

  let spriteDirArr = [];
  imageSpriteDir.forEach((dir)=>{
    const arr = dir.split('/');
    const name = arr[arr.length-1];
    let path = "";
    for(var j=0; j<arr.length-1; j++){
      path += arr[j]+'/';
    }
    spriteDirArr.push(sourcePath+'assets/'+path+name+'/*png');
  });
  gulp.watch(spriteDirArr, ["sprite"]);
  gulp.watch([jsPath + '**/*.js']).on('change', browserSync.reload);

})

//----------------
//  BROWER
//----------------
gulp.task("browser-sync", ()=>{
  browserSync.init({
    server: {
      baseDir: buildPath
    },
    scrollProportionally: false,
    open: true,
    port: 8888
  })
})


//----------------
//  LAYOUT
//----------------
gulp.task("pug", ()=>{
  const pug = require("gulp-pug")
  const data = require("gulp-data")

  return gulp.src([sourcePath+"layout/**/index.pug", "!"+sourcePath+"layout/partials/**/*"])
    .pipe(plumber())

    .pipe(data((file)=> {
      const dirname = sourcePath+"json/";
      const files = fs.readdirSync(dirname);
      let json = {};
      files.forEach((filename)=>{
        json[filename.replace(".json","")] = require(dirname + filename);
      });

      return {data:json, env: variables};
    }))
    .pipe(pug({
      pretty: !isBuild
    }))
    .pipe(gulp.dest(htmlPath))
    .pipe(browserSync.stream())
})


//----------------
//  webpack
//----------------
gulp.task('webpack', (cb)=>{
  const webpackStream = require("webpack-stream");
  const webpack = require("webpack");
  const webpackConfig = require("./webpack.config");
  webpackConfig.watch = !isBuild;
  webpackConfig.plugins[0] = new webpack.DefinePlugin({
    ENV: JSON.stringify(variables)
  })

  if(isBuild == false){
    cb();
  }
  return gulp.src('')
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(jsPath));
});

//----------------
// CSS
//----------------
gulp.task("stylus", ()=>{
  const stylus = require("gulp-stylus")
  const sourcemaps  = require('gulp-sourcemaps');
  const autoprefixer = require('gulp-autoprefixer')
  return gulp.src(sourcePath+"style/**/!(_)*.styl")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(autoprefixer({
      browsers: ['last 2 version', 'iOS >= 8.1', 'Android >= 4.4'],
      cascade: false
     }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.stream())
})

//----------------
// SPRITE
//----------------
gulp.task('sprite', ()=> {
  const merge = require('merge-stream');
  let merged = merge();


  imageSpriteDir.forEach((dir)=>{

    const arr = dir.split('/');
    const name = arr[arr.length-1];
    let path = "";
    for(var j=0; j<arr.length-1; j++){
      path += arr[j]+'/';
    }
    let stream = spriteStream(path, name);
    merged.add(stream);
  });
  return merged;

});

let spriteStream = (path, name)=>{
  const spritesmith = require('gulp.spritesmith');
  const merge = require('merge-stream');

  let opt = {
    imgName: name+'.png',
    cssName: '_'+name+'.styl',
    imgPath: '../'+path+name+'.png',
    cssFormat: 'stylus',
    padding: 2,
    cssVarMap: function (sprite) {
      sprite.name = name+ '-' + sprite.name;
    }
  };

  const spriteData = gulp.src(sourcePath+'assets/'+path+name+'/*png')
  .pipe(spritesmith(opt));

  const imgStream = spriteData.img
    .pipe(gulp.dest(sourcePath+"assets/"+path));
  const cssStream = spriteData.css
    .pipe(gulp.dest(sourcePath+"style/components/"));

  return merge(imgStream, cssStream);
}


//----------------
//  MINIFY
//----------------
gulp.task("minify", ()=>{
  var uglify = require('gulp-uglify');
  var cleanCSS = require('gulp-clean-css');
  var mergeSteram = require('merge-stream');


  const js = gulp.src(buildPath+"**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest(buildPath));

  const css = gulp.src(buildPath+"**/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest(buildPath));

  var merged = (js, css);
  return merged;
})

//----------------
//  CLEAN
//----------------
gulp.task("clean", ()=>{
  const del = require("del");
  return del(["dist/"]).then(e=>{
    // console.log("deleted", e);

  });
});

//----------------
//  COPY
//----------------
gulp.task("copy", ()=>{
  //一度対象フォルダ内を空にしてからコピーし直す。
  const fs = require('fs');
  const dirname = sourcePath+"assets/";
  const files = fs.readdirSync(dirname);
  const del = require('del');
  const cpx = require('cpx');
  let arr = [];
  files.forEach((filename)=>{
    if(filename == 'js') return;
    arr.push(buildPath+filename+"/");
  });
  // console.log(arr);
  del(arr).then(e=>{
    return cpx.copy(sourcePath+"assets/**/*", buildPath, ()=>{
      browserSync.reload();
    });
  });
});


//----------------
//  IMAGEMIN
//----------------
gulp.task('imagemin', ()=>{
  var imagemin = require("gulp-imagemin");
  var pngquant = require("imagemin-pngquant");
  var mozjpeg = require('imagemin-mozjpeg');

  return gulp.src('dist/**/*')
    .pipe(plumber())
    .pipe(imagemin([
       pngquant({
         quality: '80-90',
         speed: 1,
         floyd:0
       }),
       mozjpeg({
         quality:85,
         progressive: true
       }),
       imagemin.svgo(),
       imagemin.optipng(),
       imagemin.gifsicle()
     ]
  ))
  .pipe(imagemin())
  .pipe(gulp.dest('dist/'));
});


//----------------
// SFTP
// sshconfig.jsを別ファイルに作ってgitignoreする
// "dev": { host: 'hogehoge.com', port: 22, path: '/home/www/test_dev/'},
// "stg": { host: 'hogehoge.com', port: 22, path: '/home/www/test_stg/'},
// "release": { host: 'hogehoge.com', port: 22, path: '/home/www/test_release/'}
//----------------
gulp.task("sftpdeploy", ()=>{
  const rsync = require('gulp-rsync');
  const sshconfig = require('./sshconfig')

  let config;
  switch(process.env.NODE_ENV){
    case "release":
      config = sshconfig.release
      break
    case "stg":
      config = sshconfig.stg
      break
    case "dev":
    default:
      config = sshconfig.dev
    break
  }

  return gulp.src(buildPath+'**')
    .pipe(rsync({
      root: buildPath,
      hostname: sshconfig.host,
      port: sshconfig.port,
      destination: sshconfig.path
  }));
})

//----------------
//  AWS
//  s3にデプロイするときは
//  s3config.jsとか別ファイルで作ってignoreしておく
//  "dev": { "accessKeyId": "XXXXXXXXXXXXXXXXXXXX", "secretAccessKey": "XXXXXXXXXXXXXXX", "region": "XXXXXXXXXX", "bucket": www.hgoe.com, "path": "test_dev/" },
//  "stg": { "accessKeyId": "XXXXXXXXXXXXXXXXXXXX", "secretAccessKey": "XXXXXXXXXXXXXXX", "region": "XXXXXXXXXX", "bucket": www.hgoe.com, "path": "test_srg/" },
//  "release": { "accessKeyId": "XXXXXXXXXXXXXXXXXXXX", "secretAccessKey": "XXXXXXXXXXXXXXX", "region": "XXXXXXXXXX", "bucket": www.hgoe.com, "path": "test_release/" },
//----------------
gulp.task('s3deploy', ()=>{
  const AWS = require('aws-sdk');
  const async = require('async');
  const s3 = require('s3');
  const s3config = require('s3config.js')

  let config;
  switch(process.env.NODE_ENV){
    case "release":
      config = s3config.release
      break
    case "stg":
      config = s3config.stg
      break
    case "dev":
    default:
      config = s3config.dev
    break
  }


  AWS.config.loadFromPath(path.join(__dirname,"./keys/", config));
  AWS.config.update({region: 'ap-northeast-1'});
  const awss3 = new AWS.S3();
  const options = {
    s3Client: awss3,
  };
  const client = s3.createClient(options);

  const uploadFunc = () =>{
    return new Promise((resolve, reject)=>{

      const params = {
        localDir: buildPath,
        deleteRemoved: false,
        s3Params: {
          Bucket: s3config.bucket,
          Prefix: s3config.path
        },
      };
      const uploader = client.uploadDir(params);
      uploader.on('error', function(err) {
        reject(err);
      });
      uploader.on('progress', function() {
        console.log("progress", uploader.progressAmount, uploader.progressTotal);
      });
      uploader.on('end', function() {
        resolve();
        console.log("done uploading");
      });
    });
  }

  Promise.resolve()
  .then(()=> {
    return uploadFunc();
  });
});




