import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import getBabelCommonConfig from './getBabelCommonConfig';
import getTSCommonConfig from './getTSCommonConfig';
import { existsSync } from 'fs';
import path, { join, resolve } from 'path';
import rucksack from 'rucksack-css';
import autoprefixer from 'autoprefixer';
import px2rem from 'postcss-pxtorem';
import precss from 'precss';
import glob from 'glob';


// 获取指定路径下的入口文件
function getEntries(globPath, exclude) {
  const files = glob.sync(globPath);
  const entries = {};
  files.forEach((filepath) => {
    if (exclude && exclude.test(filepath)) {
      return;
    }
    // 取倒数第二层(view下面的文件夹)做包名
    const split = filepath.split('/');
    const name = split[split.length - 2];
    entries[name] = filepath;
  });

  return entries;
}


/* eslint quotes:0 */

export default function getWebpackCommonConfig(args, options = {}) {
  const configPath = join(__dirname, './config.js');
  const pkgPath = join(args.cwd, 'package.json');
  const pkg = existsSync(pkgPath) ? require(pkgPath) : {};
  const config = existsSync(configPath) ? require(configPath) : {};
  const env = args.env;
  const port = args.port || 9000;
  const hot = args.hot || true;
  const jsFileName = args.hash ? '[name]-[chunkhash:6].js' : '[name].js';
  const cssFileName = args.hash ? '[name]-[chunkhash:6].css' : '[name].css';
  const commonName = args.hash ? 'common-[hash:6].js' : 'common.js';

  let baseDir = args.cwd;
  if (args.baseDir) {
    baseDir = join(args.cwd, args.baseDir);
  }

  const babelQuery = getBabelCommonConfig();
  const tsQuery = getTSCommonConfig();
  tsQuery.declaration = false;

  let theme = {};
  if (pkg.theme && typeof (pkg.theme) === 'string') {
    let cfgPath = pkg.theme;
    // relative path
    if (cfgPath.charAt(0) === '.') {
      cfgPath = resolve(args.cwd, cfgPath);
    }
    const getThemeConfig = require(cfgPath);
    theme = getThemeConfig();
  } else if (pkg.theme && typeof (pkg.theme) === 'object') {
    theme = pkg.theme;
  }

  const emptyBuildins = [
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'fs',
    'module',
    'net',
    'readline',
    'repl',
    'tls'
  ];

  const browser = pkg.browser || {};
  const projectName = args.packageName || pkg.name || '';
  const node = emptyBuildins.reduce((obj, name) => {
    if (!(name in browser)) {
      return { ...obj, ...{ [name]: 'empty' } };
    }
    return obj;
  }, {});


  const retVal = {
    ...config,
    baseDir,
    babel: babelQuery,
    projectName,
    ts: {
      transpileOnly: true,
      compilerOptions: tsQuery
    },
    output: {
      path: join(process.cwd(), './dist/'),
      filename: jsFileName,
      chunkFilename: jsFileName
    },

    devtool: args.devtool,

    resolve: {
      modulesDirectories: ['node_modules', join(__dirname, '../node_modules')],
      extensions: ['', '.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json']
    },

    resolveLoader: {
      modulesDirectories: ['node_modules', join(__dirname, '../node_modules')],
      alias: {
        "react-proxy": path.join(__dirname, "..")
      }
    },
    entry: pkg.entry,

    node,
    devServer: {
      hot: true,
      inline: true,
      port,
      stats: { colors: true, progress: false },
      compress: true,
      quiet: false,
      clientLogLevel: 'info',
      open: false,
      proxy: {
        '/api': {
          changeOrigin: true,
          target: 'http://localhost:3000',
          secure: false
        }
      }
    },
    module: {
      noParse: [/moment.js/],
      loaders: [
        {
          //test: /\.js$/,
          test(filePath) {
            let matchFlg = false;
            if (/rs\-.+\.js$/.test(filePath)) {
              matchFlg = true;
            } else if (/\.js$/.test(filePath) && !/node_modules/.test(filePath)) {
              matchFlg = true;
            }
            return matchFlg;
          },
          //exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          query: babelQuery
        },
        {
          test: /\.jsx$/,
          loader: require.resolve('babel-loader'),
          query: babelQuery
        },
        {
          test: /\.tsx?$/,
          loaders: [require.resolve('babel-loader'), require.resolve('ts-loader')]
        },
        {
          test(filePath) {
            return /\.rspl$/.test(filePath) && !/\.module\.rspl$/.test(filePath);
          },
          loader: "string"
        },
        {
          test(filePath) {
            return /\.tpl$/.test(filePath) && !/\.module\.tpl$/.test(filePath);
          },
          loader: "string"
        },
        {
          test(filePath) {
            return /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath);
          },
          loader: ExtractTextPlugin.extract(
            `${require.resolve('css-loader')}` +
            `?sourceMap&-restructuring&-autoprefixer!${require.resolve('postcss-loader')}`
          )
        },
        {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(
            `${require.resolve('css-loader')}` +
            `?sourceMap&-restructuring&modules&localIdentName=[local]___[hash:base64:5]&-autoprefixer!` +
            `${require.resolve('postcss-loader')}`
          )
        },
        {
          test(filePath) {
            return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
          },
          loader: ExtractTextPlugin.extract(
            `${require.resolve('css-loader')}?sourceMap&-autoprefixer!` +
            `${require.resolve('postcss-loader')}!` +
            `${require.resolve('less-loader')}?{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
          )
        },
        {
          test: /\.module\.less$/,
          loader: ExtractTextPlugin.extract(
            `${require.resolve('css-loader')}?` +
            `sourceMap&modules&localIdentName=[local]___[hash:base64:5]&-autoprefixer!` +
            `${require.resolve('postcss-loader')}!` +
            `${require.resolve('less-loader')}?` +
            `{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
          )
        },
        {
          test(filePath) {
            return /\.scss$/.test(filePath) && !/\.module\.scss$/.test(filePath);
          },
          exclude: /node_modules/,
          loader: ExtractTextPlugin.extract(
            `${require.resolve('css-loader')}?sourceMap&-autoprefixer!` +
            `${require.resolve('postcss-loader')}!` +
            `${require.resolve('sass-loader')}?{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
          )
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          loader: `${require.resolve('url-loader')}?` +
            `limit=10000&minetype=application/font-woff`
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          loader: `${require.resolve('url-loader')}?` +
            `limit=10000&minetype=application/font-woff`
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: `${require.resolve('url-loader')}?` +
            `limit=10000&minetype=application/octet-stream`
        },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: `${require.resolve('file-loader')}` },
        // 与antd-mobile的svg处理方案冲突
        //{
        //  test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        //  loader: `${require.resolve('url-loader')}?` +
        //  `limit=10000&minetype=image/svg+xml`,
        //},
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          loader: `${require.resolve('url-loader')}?limit=10000&name=images/[name].[hash:6].[ext]`
        },
        { test: /\.json$/, loader: `${require.resolve('json-loader')}` }
      ]
    },

    postcss: [
      rucksack(),
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4']
      })
    ],
    favicon: '',
    plugins: [
      new ExtractTextPlugin(cssFileName, {
        disable: false,
        allChunks: true
      }),
      new webpack.optimize.OccurenceOrderPlugin(),
      new CaseSensitivePathsPlugin()
    ]
  };

  if (!args.unExact) {
    retVal.plugins = [new webpack.optimize.CommonsChunkPlugin('common', commonName)].concat(retVal.plugins);
  }

  // 生产,stg环境
  if (env === 'prd' || env === 'stg') {
    // 加入生产环境定义
    retVal.plugins = [
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      })
    ].concat(retVal.plugins);
  } else {
    // 加入调试模块
    // 加入开发环境定义
    retVal.plugins = [
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("development")
        }
      })
    ].concat(retVal.plugins);
  }
  if (args.server) {
    retVal.plugins = [new webpack.HotModuleReplacementPlugin()].concat(retVal.plugins);
  }
  if (args.useRem) {
    retVal.postcss.push(px2rem({ rootValue: 75, propList: ['*'], minPixelValue: 2 }));
    retVal.postcss.push(precss);
  }
  if (!args.customEntry) {
    let entries = '';
    if (options.local) {
      entries = getEntries(join(baseDir, 'src/modules/*/index-local.js'), /common/);
    } else if (options.remote) {
      entries = getEntries(join(baseDir, 'src/modules/*/index-local.js'), /common/);
    } else {
      entries = getEntries(join(baseDir, 'src/modules/*/index.js'), /common/);
    }
    retVal.entry = {};
    let configFileName = `${join(args.cwd, 'config')}/config.${env}.js`;
    if (!existsSync(configFileName)) {
      configFileName = '';
    }
    Object.keys(entries).forEach((name) => {
      // 每个页面生成一个entry，如果需要HotUpdate，在这里修改entry
      if (args.server && hot) {
        retVal.entry[name] = [
          `webpack-dev-server/client?http://localhost:${port}/`,
          'webpack/hot/dev-server',
          entries[name]
        ];
      } else {
        retVal.entry[name] = [
          'babel-polyfill',
          entries[name]
        ];
        if (configFileName) {
          retVal.entry[name].unshift(configFileName);
        }
      }
    });
  }
  retVal.baseDir = retVal.baseDir || args.cwd;
  return retVal;
}
