'use strict';

const { series, watch } = require('gulp');

const buildLib = require('./build/build-lib.js');

const buildChangeLog = require('./build/build-lui.js');

const buildReadme = require('./build/build-readme.js');

const util = require('./build/util.js');

const browserSync = require('browser-sync'); // 用于生成开发服务器

// const loadPlugins = require("gulp-load-plugins");

const minimist = require('minimist');

// * 用于加载gulp-*的脚本, 而不需要手动require
// const plugins = loadPlugins();

// * browserSync 提供了一个 create 方法用于创建服务器
const bs = browserSync.create();

const knownOptions = {
  string: 'env',
  default: {
    key: true,
    env: process.env.NODE_ENV || 'production'
  }
};

// * 获取命令行解析字符串
const argv = minimist(process.argv.slice(2), knownOptions).env;

// * 构建命令
const buildComp = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (argv === 'lib') {
        buildLib();
      }
      if (argv === 'release') {
        buildReadme();
        buildChangeLog();
      }

      if (argv === 'npm') {
        buildLib(() => {
          util.start();
        });
      }
      if (argv === 'readme') {
        buildReadme();
      }
      resolve();
    });
  });
};

// * 开发服务器
const serve = () => {
  watch('uni_modules/**', buildComp);

  // * 初始化一个开发服务器
  bs.init({
    server: {
      baseDir: ['uni_modules'],
      routes: {
        // 优先于baseDir的配置, 会首先查看routes下的配置, 否则才找baseDir下的文件
        // 这样dist中的node_modules 就会自动映射到当前目录下的node_modules
        '/node_modules': './node_modules'
      }
      // files: "uni_modules/**", // 那些文件修改后自动刷新浏览器, 使用reload替换他
    },
    open: false, // 启动时, 是否打开浏览器
    notify: false, // 关闭启动时的提示
    port: 9999 // port指定端口号
  });
};

const dev = series(buildComp, serve);

const build = series(buildComp);

module.exports = {
  build,
  dev
};
