# rstool-build

基于 webpack 的构建封装.

# npm服务器设置
npm set registry http://npm.corp.rs.com

# npm安装
npm i rstool-build --save-dev

# change list

### 0.1.25
增加清空缓存配置, --clearCache
启动服务器时自动加入source-map支持.

### 0.1.26
增加公共资源库动态引用

### 0.1.27
自动删除dist目录

### 0.1.28
修正兼容 [antd-mobile](https://mobile.ant.design/docs/react/introduce) 的 [Icon](https://mobile.ant.design/components/icon) 解决方案

### 0.1.29
更新pxtorem至4.0.0版本

### 0.1.30
修复pxtorem对部分属性转换无效的问题.
rem转换最小单位从0调整至2px

### 0.1.31
增加模块模板功能.

### 0.1.32
增加transform-runtime转换模块
增加--hot 参数, 默认 true
增加--port 参数, 默认 9000

### 0.1.33
增加 react-proxy-loader 模块

### 0.1.34
修改transform-runtime的兼容性.
修改babel-loader的匹配规则, 增加rs-*文件夹同样编译


### 0.1.35
删除transform-runtime插件,该插件有部分兼容性问题无法解决.
为了支持android 4.4 版本引入babel-polyfill

### 0.1.36
修复devserver部分问题.

### 0.1.37
修复域名替换不完整的bug.

### 0.1.38
优化打包速度.
增加脚本引用
>  <script type="text/javascript" src="//<%= htmlWebpackPlugin.options.libs_domain%>/rs_react_15_5_4.js"></script>
>  <script type="text/javascript" src="//<%= htmlWebpackPlugin.options.libs_domain%>/rs_react_router_4_1_1.js"></script>
>  <script type="text/javascript" src="//<%= htmlWebpackPlugin.options.libs_domain%>/rs_antd_2_8_1.js"></script>

### 0.1.39
增加aureuma_domain

### 0.1.40
修复优化打包的bug

### 0.1.41
增加 --append 参数

### 0.1.42
修复动态更新的bug

### 1.0.0
支持动静分离

### 1.0.1
增加http请求兼容(Hybrid/Browser)方案

### 1.0.2
排除rs-hybrid-bs-http组件

### 1.0.3
修复apply call undefined和CI打包失败问题

### 1.0.4
去除react-router-dom依赖

### 1.0.5
增加unExact命令，禁止抽取公共js

### 1.0.6
修复dev,uat打包chunkhash问题

### 1.0.7
zip包命名增加随机值

### 1.0.8
指定node-sass版本为4.7.2

### 1.0.9
修复config路径错误问题
