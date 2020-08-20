# webpack 的基本使用

这个仓库主要描述了如何从 0 到 1 搭建一个基础的 webpack 打包 demo

## 1.webpack 是什么？

由官网可知，`webpack` 是一个现代 `JavaScript` 应用程序的静态模块打包器，当 `webpack` 处理应用程序时，会递归构建一个依赖关系图，其中包含应用程序需要的每个模块，然后将这些模块打包成一个或多个 `bundle`

## 2.webpack 核心概念

webpack 几个核心概念如下

1.  entry: 打包入口配置，通过入口配置，webpack 可递归构建依赖图
2.  output: 打包后输出配置
3.  loader: 模块转化器，webpack 通过不同的 loader 处理不同的模块资源
4.  plugins: 拓展插件，在 webpack 打包构建流程中，不同的 plugin 监听不同的事件，在这些事件暴露的钩子函数中注入拓展逻辑，来改变构建结果或是其他想要做的事

## 3.初始化项目

通过一下命令行，初始化一个 demo（请确保你的电脑安装了 node 环境）

```
mkdir elementary-webpack-config
cd element-webpack-config
npm init -y
npm install webpack webpack-cli -D
```

执行上述命令以后，在当前文件夹新建一个'src/index.js'文件，随便写点 js 代码

```js
class WebDeveloper {
  constructor({ name, age }) {
    this.name = name
    this.age = age
    this.desc = '是只程序猿哦'
  }
  getName() {
    return this.name
  }
}

const newWebDeveloper = new WebDeveloper({ name: 'wjm', age: '24' })

console.log('新生成的开发者', newWebDeveloper)
```

自 webpack4.0 以后，webpack 内置了基础的配置文件，所以即使没有写任何配置文件，也可直接使用。命令行输入`npx webpack --mode=development`，因为 webpack 构建时默认的`mode`是`production`，这里为了了解打包后的代码发生了什么改变，故而使用`development`。执行命令以后可以看到，项目下多出了个`dist`目录，目录下有一个构建出来的`main.js`文件

查看`dist/main.js`文件，可以看到还是高版本的代码，并没有被转化成可兼容老版本浏览器的低版本代码，这显然不是 webpack 构建所期待的结果。

## 4.Babel

Babel 是一个工具链，主要是用来将 ECMAScript2015+的高版本 JS 代码将代码转换为能在老旧浏览器(这里点名吐槽 ie)运行的低版本 JS 代码。要在 webpack 中使用 Babel 来转换 js 代码，就要使用到 babel-loader。正如前文所言，loader 是模块转化器，而 babel-loader 则专门负责处理 js 模块资源，将高版本 js 转换为低版本的。

首先，安装下 babel-loader`npm install babel-loader -D`

其次还有几个重要的 babel 相关的依赖包，执行`npm install @babel/cli @babel/core @babel/preset-env @babel/polyfill -D`

这里简单介绍下这几个包的作用：

@bable/cor--Bable 核心模块，没有该模块将无法使用 Babel 编译 JS 文件

@babel/cli--Babel 内置的 CLI，通过该 CLI 可使用命令行编译 JS 文件

@babel/preset--preset 虽然已经大大方便了我们的使用，但是如果我们还想使用更新一些的语法，比如 es2016 的\*\*（相当于 pow()）,es2017 的 async/await 等等，我们就要引入@babel/preset-es2016，@babel/preset-es2017 之类的，而且随着 js 语法的更新，这些 preset 会越来越多。于是 babel 推出了 babel-env 预设，这是一个智能预设，只要安装这一个 preset，就会根据你设置的目标浏览器，自动将代码中的新特性转换成目标浏览器支持的代码

@babel/polyfill--@babel/polyfill 模块包括 core-js 和一个自定义的 regenerator runtime 模块，可以模拟完整的 ES2015+ 环境

@babel/plugin-transform-runtime--这是一个可以重复使用 Babel 注入的帮助程序，以节省代码大小的插件。需要注意的是，`@babel/plugin-transform-runtime` 需要和 `@babel/runtime` 配合使用。`@babel/plugin-transform-runtime` 通常仅在开发时使用，但是运行时最终代码需要依赖 `@babel/runtime`，所以 `@babel/runtime` 必须要作为生产依赖被安装

了解以上一些基础知识以后，在根目录下新建一个 webpack 配置文件`webpack.config.js`

```js
//  webpack.config.js
module.exports = {
  //  ...
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        //  不编译node_modules目录
        exclude: /node_modules/
      }
    ]
  }
}
```

接在在根目录下创建一个 Babel 配置文件`babelrc.config.js`

```js
//  babel.config.js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3
      }
    ]
  ]
}
```

现在重新执行`npx webpack --mode=development`，再看打包结果，会发现`dist/main.js`已经被编译为低版本的代码了

## 打包模式

webapck 支持两种打包模式，分别是`development`和`production`。根据不同的模式，webpack 会使用相应模式进行内置优化，所以`mode`参数如果省略没写，控制台会提示缺少该参数，进而使用默认参数`production`

该参数可通过命令行写入`npx wbpack --mode=development`，也可通过 webpack 配置文件写入

```js
//  webpack.config.js
module.exports = {
  //  ...
  mode: 'development',
  module: {
    //  ...
  }
}
```

## 打包的文件注入到指定模板

通过 webpack 构建文件，有时候我们会配置打包输出的文件名带 hash 值，那么每次打包生成的 js 文件名就会各不相同，如果每次手动去修改模板的`<script>`标签的引用 js 文件名，效率无疑是非常低下的。

面对这种情况，可以使用 webpack 的插件`html-webpack-plugin`，老规矩，首先在项目里安装该插件`npm install html-webpack-plugin -D`

新建一个文件'public/index.html',作为打包输出的 html 模板

在 webpack 配置文件中引入`html-webpack-plugin`

```js
//  webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  //  ...
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ]
}
```

重新执行`npx webpack`，可以看到`dist`目录下多了个'index.html'文件，这个 html 文件自动插入了项目打包输出的 js 文件

在项目开发中，我们的脚手架不仅仅是给自己使用，也许还提供给其他业务用，模板 hhml 文件的可配置性就显得尤为有用。比如，公司又有专门的部门提供 A 页的公共 js 和公共 css，埋点 jsdk 以及分享的 jsdk，但并不是每个业务都需要使用到这些内容。

一个功能可能由若干个 js 和 css 文件组成的，如果每次都是业务自行修改'public/index.html'文件，也是挺麻烦的，一方面业务需要理清每个功能需要哪些文件，另一方面他们还得来给配置，这无疑增大了项目的开发难度。

所以应该通过增加配置文件，来选择性使用功能，打包构建时，可根据配置文件，生成相对应的 html 文件。

比如，我们在 public 下增加一个`html.confgi.js`文件

```js
//  html.config.js
module.exports = {
  dev: {
    template: {
      title: '页面A',
      header: false,
      footer: true
    }
  },
  build: {
    template: {
      title: '页面B',
      header: true,
      footer: false
    }
  }
}
```

然后来`webpack.config.js`引入配置文件

```js
//  webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'
const config = require('./public/html.config.js')[isDev ? 'dev' : 'build']
```
