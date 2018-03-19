import { tmpdir } from 'os';

export default function babel() {
  return {
    cacheDirectory: tmpdir(),
    presets: [
      require.resolve('babel-preset-es2015-ie'),
      require.resolve('babel-preset-react'),
      require.resolve('babel-preset-stage-3')
    ],
    plugins: [
      //require.resolve('babel-plugin-transform-runtime'),
      //[
      //  'transform-runtime', {
      //  helpers: false,
      //  polyfill: false,
      //  regenerator: true
      //}],
      require.resolve('babel-plugin-add-module-exports'),
      require.resolve('babel-plugin-transform-decorators-legacy'),
      require.resolve('babel-plugin-transform-class-properties')
      //[require.resolve('babel-plugin-import'), [{
      //  "libraryName": "antd", "style": true
      //}, {
      //  "libraryName": "antd-mobile",
      //  "style": true
      //}]]
    ]
  };
}
