module.exports = function (webpackConfig) {
  //entry
  // 添加一个plugin
  //webpackConfig.plugins.push(
  //  new webpack.DefinePlugin({
  //    __DEV__: JSON.stringify('true')
  //  })
  //);
  //webpackConfig.devtool = 'source-map';
  //webpackConfig.entry = {
  //  m: './src/modules/sample/index.js'
  //}
  webpackConfig.externals = {
    // 'react': 'React',
    // 'react-dom': 'ReactDOM',
  //  //'react-router': 'ReactRouter',
  //  //'iscroll': 'iscroll',
  }
  // antd-mobile的svg处理方案
  const path = require('path');

  const svgDirs = [
    require.resolve('antd-mobile').replace(/warn\.js$/, ''),  // 1. 属于 antd-mobile 内置 svg 文件
    // path.resolve(__dirname, 'src/my-project-svg-foler'),  // 2. 自己私人的 svg 存放目录
  ];
  webpackConfig.module.loaders.push({
    test: /\.(svg)$/i,
    loader: 'svg-sprite',
    include: svgDirs,  // 把 svgDirs 路径下的所有 svg 文件交给 svg-sprite-loader 插件处理
  })
  webpackConfig.babel.plugins.push(['import', { libraryName: 'antd-mobile', style: 'css' }]);
  // 返回 webpack 配置对象
  return webpackConfig;
};
