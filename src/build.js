import { join, resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import webpack, { ProgressPlugin } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import mergeCustomConfig from './mergeCustomConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';
const config = require('./config.js');
const glob = require('glob');
const fs = require('fs');
const del = require('del');
import HtmlWebpackPlugin from 'html-webpack-plugin';
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function getWebpackConfig(args) {
  let webpackConfig = getWebpackCommonConfig(args);

  webpackConfig.plugins = webpackConfig.plugins || [];

  // Config outputPath.
  if (args.outputPath) {
    webpackConfig.output.path = args.outputPath;
  }
  // 清除dist目录
  if (!args.append) {
    del(webpackConfig.output.path);
  }

  if (args.publicPath) {
    webpackConfig.output.publicPath = args.publicPath;
  }

  if (args.cdn) {
    webpackConfig.output.publicPath = config.dummy_domain;
  }

  if (args.env) {
    webpackConfig.env = args.env;
  }

  if (args.clearCache) {
    // 清除node_modules目录
    del(join(args.cwd, 'node_modules'));
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
  const dllRoot = path.join(__dirname, '..', 'dll');
  const manifestDir = path.join(dllRoot, 'manifest');
  const jsonFiles = fs.readdirSync(manifestDir);
  const dllPlugins = [];
  const dllJSFiles = [];
  jsonFiles.forEach((fileName) => {
    const fullName = path.join(manifestDir, fileName);
    if (pkg.dependencies) {
      // antd
      if (pkg.dependencies.hasOwnProperty('antd') && /antd_\d+_\d+_\d+\.json/.test(fileName)) {
        dllPlugins.push({
          context: args.cwd,
          manifest: require(fullName)
        });
        dllJSFiles.push(fileName);
      }
    }
  });
  if (args.hash) {
    webpackConfig.output.filename = webpackConfig.output.chunkFilename = '[name]-[chunkhash:6].js';
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

  if (dllPlugins.length > 0) {
    webpackConfig.plugins.push(new webpack.DllReferencePlugin(...dllPlugins));
    const libRoot = path.join(dllRoot, 'libs');
    webpackConfig.plugins.push(new CopyWebpackPlugin([{
      from: libRoot
    }]));
  }
  // let domain = '.rs.com';
  const env = args.env || 'dev';
  let fullDomain = '';
  let aureumaDomain = '';
  let dllReference = '';
  if (env) {
    const environment = config.environment[env];
    const cdn = config.cdnMapping.others.cdn;
    if (environment) {
      fullDomain = `${cdn}.${environment.domain}`;
      aureumaDomain = environment.aureuma_domain;
      dllReference = `${config.cdnMapping.others.cdn}.${environment.domain}/${pkg.name}/rs_antd_2_8_1.js`;
    }
  }
  console.log(dllReference);

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

        let template = join(modulePath, 'index.html');
        if (fs.existsSync(template)) {
          pluginConfig.template = template;
        } else {
          template = join(webpackConfig.baseDir, 'src', 'template.html');
          if (fs.existsSync(template)) {
            pluginConfig.template = template;
          }
        }
        if (fullDomain) {
          pluginConfig.domain = fullDomain;
          pluginConfig.libs_domain = `${fullDomain}/${pkg.name}`;
        }
        if (aureumaDomain) {
          pluginConfig.aureuma_domain = aureumaDomain;
        }

        // 每个页面生成一个html
        const plugin = new HtmlWebpackPlugin({
          ...pluginConfig,
          // 生成出来的html文件名
          filename: `${key}.html`,
          // favicon: favicon,
          // 每个html的模版，这里多个页面使用同一个模版
          // template: path.join(args.cwd, 'src', 'template.html'),
          // 自动将引用插入html
          inject: 'body',
          // title: title,
          // 每个html引用的js模块，也可以在这里加上vendor等公用模块
          chunks: !args.unExact ? ['common', key] : [key]
        });
        webpackConfig.plugins.push(plugin);
      });
    }
  }
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
  let devServer = {};
  let cdnMap = {};
  let envDomain = 'dev';
  let projectName = '';
  let dummyDomain = config.dummy_domain;
  if (dummyDomain && /\/$/.test(dummyDomain)) {
    dummyDomain = dummyDomain.replace(/\/$/, '');
  }
  webpackConfig.forEach(perWebpackConfig => {
    if (perWebpackConfig.devServer) {
      devServer = perWebpackConfig.devServer;
    }
    if (perWebpackConfig.cdnMapping) {
      cdnMap = perWebpackConfig.cdnMapping;
    }
    if (args.env && perWebpackConfig.environment) {
      const env = perWebpackConfig.environment[args.env] || {};
      envDomain = env.domain || perWebpackConfig.environment.dev.domain;
    }
    if (perWebpackConfig.projectName) {
      projectName = perWebpackConfig.projectName;
    }
  });

  // if (args.watch) {
  webpackConfig.forEach(perWebpackConfig => {
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
    if (args.cdn) {
      const files = glob.sync(join(fileOutputPath, '**/*.{html,js,css,map}'));
      const cdnMapping = cdnMap;
      const strRegex = `${dummyDomain}\/([^"|^)]+)`;

      const regex = new RegExp(strRegex, 'g');
      files.forEach((file) => {
        let fileContent = readFileSync(file, 'utf-8');
        fileContent = fileContent.replace(regex, (search) => {
          let retVal = search;
          Object.keys(cdnMapping).forEach((cdnKey) => {
            const entry = cdnMapping[cdnKey];
            const tmpRegex = new RegExp(`${strRegex}\.${entry.name}`, 'g');
            const domain = `//${entry.cdn}.${envDomain}`;
            if (tmpRegex.test(search)) {
              retVal = search.replace(tmpRegex, `${domain}/${projectName}/$1.${entry.name}`);
              return;
            }
          });
          return retVal;
        });
        fileContent = fileContent.replace(dummyDomain,
          `//${cdnMapping.image.cdn}.${envDomain}/${projectName}`);
        writeFileSync(file, fileContent, 'utf-8');
      });
    }
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

    if (err) {
      process.on('exit', () => {
        process.exit(1);
      });
      console.error(err);
    }

    if (callback) {
      callback(err);
    }
  }

  // 服务器启动时自动添加source-map
  if (args.server) {
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
    compiler.watch(args.watch || 200, doneHandler);
  }
  if (args.server) {
    const webpackDevServer = new WebpackDevServer(compiler, devServer);
    webpackDevServer.listen(args.port || 9000);
  } else {
    compiler.run(doneHandler);
  }
}
