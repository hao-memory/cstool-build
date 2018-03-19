import { join, resolve } from 'path';
import { writeFileSync } from 'fs';
import webpack, { ProgressPlugin } from 'webpack';
import chalk from 'chalk';
import mergeCustomConfig from './mergeCustomConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';
const config = require('./config.js');
const fs = require('fs');
const del = require('del');
import HtmlWebpackPlugin from 'html-webpack-plugin';
const outputPath = 'dist-local';
function getWebpackConfig(args) {
  let webpackConfig = getWebpackCommonConfig(args, {
    local: true
  });

  webpackConfig.plugins = webpackConfig.plugins || [];

  // Config outputPath.
  webpackConfig.output.path = outputPath;
  // 清除dist目录
  if (!args.append) {
    del(webpackConfig.output.path);
  }

  if (args.env) {
    webpackConfig.env = args.env;
  }

  // Config if no --no-compress.
  if (args.compress) {
    webpackConfig.UglifyJsPluginConfig = {
      output: {
        ascii_only: true
      },
      compress: {
        warnings: false
      }
    };
    webpackConfig.plugins = [...webpackConfig.plugins,
    new webpack.optimize.UglifyJsPlugin(webpackConfig.UglifyJsPluginConfig),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }),
    new webpack.optimize.DedupePlugin()
    ];
  } else {
    if (process.env.NODE_ENV) {
      webpackConfig.plugins = [...webpackConfig.plugins,
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      })
      ];
    }
  }

  webpackConfig.plugins = [...webpackConfig.plugins,

  new webpack.NoErrorsPlugin()
  ];
  // Output map.json if hash.
  const pkg = require(join(args.cwd, 'package.json'));
  if (args.hash) {
    // if (args.local) {
    //   webpackConfig.output.filename = webpackConfig.output.chunkFilename = '[name]-[chunkhash:6].js';
    // } else {
    //   webpackConfig.output.filename = webpackConfig.output.chunkFilename = '[name]-[chunkhash:6].js';
    // }
    // webpackConfig.plugins = [...webpackConfig.plugins,
    //  require('map-json-webpack-plugin')({
    //    assetsPath: pkg.name,
    //    cache,
    //  }),
    // ];
  }

  if (typeof args.config === 'function') {
    webpackConfig = args.config(webpackConfig) || webpackConfig;
  } else {
    webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));
  }
  // let domain = '.rs.com';

  if (!args.customEntry && webpackConfig.entry) {
    if (!Array.isArray(webpackConfig.entry)) {
      Object.keys(webpackConfig.entry).forEach((key) => {
        const pluginConfig = {};
        const modulePath = join(webpackConfig.baseDir, 'src', 'modules', key);
        const configFile = join(modulePath, 'config.json');
        if (fs.existsSync(configFile)) {
          const perConfig = require(configFile);
          pluginConfig.title = perConfig.html.title;
        }
        const faviconFile = join(webpackConfig.baseDir, 'src', 'imgs', 'favicon.png');
        if (fs.existsSync(faviconFile)) {
          pluginConfig.favicon = faviconFile;
        }

        // 每个html的模版，这里多个页面使用同一个模版
        let template = join(modulePath, 'index.html');
        if (fs.existsSync(template)) {
          pluginConfig.template = template;
        } else {
          template = join(webpackConfig.baseDir, 'src', 'template-local.html');
          if (fs.existsSync(template)) {
            pluginConfig.template = template;
          }
        }

        // 每个页面生成一个html
        const plugin = new HtmlWebpackPlugin({
          ...pluginConfig,
          // 生成出来的html文件名
          filename: `${key}.html`,
          // favicon: favicon,
          // 自动将引用插入html
          inject: 'body',
          // title: title,
          // 每个html引用的js模块，也可以在这里加上vendor等公用模块
          chunks: !args.unExact?['common', key]:[key]
        });
        webpackConfig.plugins.push(plugin);
      });
    }
  }
  delete webpackConfig.externals;
  return webpackConfig;
}

export default function build(args, callback) {
  // Get config.
  let webpackConfig = getWebpackConfig(args, {});
  webpackConfig = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];
  //
  //
  let fileOutputPath;
  webpackConfig.forEach(preWebpackConfig => {
    fileOutputPath = preWebpackConfig.output.path;
  });
  let dummyDomain = config.dummy_domain;
  if (dummyDomain && /\/$/.test(dummyDomain)) {
    dummyDomain = dummyDomain.replace(/\/$/, '');
  }

  let baseDir = __dirname;

  // if (args.watch) {
  webpackConfig.forEach(perWebpackConfig => {
    baseDir = perWebpackConfig.baseDir;
    perWebpackConfig.plugins.push(
      new ProgressPlugin((percentage, msg) => {
        const stream = process.stderr;
        if (stream.isTTY && percentage < 0.71) {
          stream.cursorTo(0);
          stream.write(`📦  ${chalk.magenta(msg)}`);
          stream.clearLine(1);
        } else if (percentage === 1) {
          console.log(chalk.green('\nwebpack: bundle build is now finished.'));
        }
      })
    );
  });
  // }

  function doneHandler(err, stats) {
    if (args.json) {
      const filename = typeof args.json === 'boolean' ? 'build-bundle.json' : args.json;
      const jsonPath = join(fileOutputPath, filename);
      writeFileSync(jsonPath, JSON.stringify(stats.toJson()), 'utf-8');
      console.log(`Generate Json File: ${jsonPath}`);
    }

    const { errors } = stats.toJson();
    if (errors && errors.length) {
      process.on('exit', () => {
        process.exit(1);
      });
    }
    // if watch enabled only stats.hasErrors would log info
    // otherwise  would always log info
    if (!args.watch || stats.hasErrors()) {
      const buildInfo = stats.toString({
        colors: true,
        children: true,
        chunks: !!args.verbose,
        modules: !!args.verbose,
        chunkModules: !!args.verbose,
        hash: !!args.verbose,
        version: !!args.verbose
      });
      if (stats.hasErrors()) {
        console.error(buildInfo);
      } else {
        console.log(buildInfo);
      }
    }
    if (callback) {
      callback(err);
    }
  }

  // 服务器启动时自动添加source-map
  if (args.env === 'dev' || args.env === 'uat1') {
    webpackConfig.devtool = 'source-map';
  }
  // Run compiler.
  const compiler = webpack(webpackConfig);

  // Hack: remove extract-text-webpack-plugin log
  if (!args.verbose) {
    compiler.plugin('done', (stats) => {
      stats.stats.forEach((stat) => {
        stat.compilation.children = stat.compilation.children.filter((child) => {// eslint-disable-line
          return child.name !== 'extract-text-webpack-plugin';
        });
      });
    });
  }

  if (args.watch) {
    // compiler.watch(args.watch || 200, doneHandler);
  }

  compiler.run(doneHandler);
}
