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

## webpack 入口配置

在根目录下新建一个`webpack`配置文件`webpack.config.js`。

`webpack`打包时，通过入口文件来获取整个项目项目的依赖。`webpack`的入口字段为`entry`，`entry`的值可以是一个字符串，或者一个数组，亦或是一个对象

```js
//  webpack.config.js
module.exports = {
  //  以我们新建的index.js文件为入口
  entry: './src/index.js'
}
```

## webpack 出口配置

通过配置`output`，可以控制`webpack`如何输出编译文件，常用的`output`配置如下

```js
//  webpack.config.js
const path = require('path')
module.exports = {
  entry: './src/index.js'，
  output: {
    //  打包后的文件放在哪个目录，必须是绝对路径，这里的配置是打包后放在项目根目录下的`dist`文件夹
    path: path.resolve(__dirname, 'dist'),
    //  打包后的文件命名
    filename: 'bundle.js',
    //  这个通常是设置为CDN地址
    publicPath: ''
  }
}
```

假如我们打包编译出来的项目，是部署在 CDN 上的，上线后的地址是`https://my.cdn.com/myproject/index`，那么可以将生产环境下的打包配置中的`publicPath`指定为`https://my.cdn.com`。考虑到 CDN 缓存的问题，输出的打包文件名需要加上 hash，比如设置为`filename:'bundle.[hash:6].js'`

自 webpack4.0 以后，webpack 内置了基础的配置文件，所以即使没有写任何配置文件，也可直接使用。当然我们这里写了个 webpack 配置文件的`entry`字段和`output`字段，命令行输入`npx webpack --mode=development`，因为 webpack 构建时默认的`mode`是`production`，这里为了了解打包后的代码发生了什么改变，故而使用`development`。执行命令以后可以看到，项目下多出了个`dist`目录，目录下有一个构建出来的`bundle.js`文件

查看`dist/bundle.js`文件，可以看到还是高版本的代码，并没有被转化成可兼容老版本浏览器的低版本代码，这显然不是 webpack 构建所期待的结果。

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

安装完依赖之后，修改`webapck`配置文件

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
module.exports = {
  //  ...
  mode: isDev ? 'development' : 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      //  打包后的文件名
      filename: 'index.html',
      //  根据isDev来决定使用哪个打包环境的html配置
      config: config.template
    })
  ]
}
```

因为`process.env`中默认没有`NODE_ENV`变量，所以我们需要利用`cross-env`来注入自定义变量，首先安装`npm install cross-env -D`

然后在`package.json`里修改命令

```json
//  package.josn
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack",
    "build": "cross-env NODE_ENV=production webpack"
  }
}
```

当然，如果要根据环境变量使用不同配置，html 模板也需要做简单修改，使用`vm`or`ejs`模板语法

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <% if(htmlWebpackPlugin.options.config.header) { %>
    <link rel="stylesheet" type="text/css" href="//common/css/header.css" />
    <% } %>
    <title><%= (htmlWebpackPlugin.options.config.title) %></title>
  </head>

  <body></body>
  <% if(htmlWebpackPlugin.options.config.header) { %>
  <script src="//common/header.min.js" type="text/javascript"></script>
  <% } %>
</html>
```

然后分别执行`npm run dev`和`npm run build`，对比下生成的`dist/index.html`，可以看到`npm run build`生成的`index.html`引入了不同的 js 和 css 文件，同时生成的 html 文件 title 也是不同的

## 开发环境代理服务器：webpack-dev-server

`webpack-dev-server`是一个 Express 的小型服务器，它是通过 Express 的中间件`webpack-dev-middleware`和`Webpack`进行交互的。

首先安装，`npm install webpack-dev-server -D`

然后修改运行命令

```json
//  package.json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack-dev-server",
    "build": "cross-env NODE_ENV=production webpack"
  }
}
```

然后执行`npm run dev`，就能在控制台看到我们的项目已经跑起来了

我们可以在`webpack.config.js`里面，修改`webpack-dev-server`的配置，常用配置参考如下

```js
//  webpack.config.js
module.exports = {
  //  http服务端口
  port: '3000',
  //  quietr如若设为true，那么除了初始启动信息之外的任何内容都不会被打印到控制台，这也意味着webpack的错误或警告在控制台不可见，所以一般不开启
  quiet: false,
  //  默认开启inline模式，如果设置为false，则开启iframe模式
  inline: true,
  //  终端是否只打印error错误，当我们开启eslint或是ts编写代码时，这个设置能帮我们排除编译信息
  stats: 'errors-only',
  //  编译出错时，是否全屏输出
  overlay: false,
  //  客户端日志输出模式
  clientLogLevel: 'silent',
  //  是否启用gzip压缩
  compress: true
}
```

## devtool

在`src/index.js`文件中，我们在第 15 行左右输入了`console.log`语句，但是在实际运行的项目中，我们会发现控制台的`console.log`语句提示的行数不正确。是因为被打包的代码是被编译压缩过的，如果代码复杂一点，很明显就比较难以定位到原项目中代码的位置了，这是不利于调试开发的。

webpack 允许我们通过配置`devtool`，帮助我们将编译后的代码映射回原始代码。不同的值会明显影响到构建和重新构建的速度。对于日常开发而言，能够定位到源码的行即可。因此，综合构建速度，在开发模式下，`dectool`的值可设为`cheap-module-eval-source-map`

```js
//  webpack.config.js
module.exports = {
  //  开发环境下使用
  devtool: 'cheap-module-eval-source-map'
}
```

在生产环境下，这个值可设为`none`或是`source-map`，使用`source-map`最终会单独打包出一个`.map`文件，我们可以根据报错信息和此`map`文件，进行错误解析，定位到源码

`source-map`和`hidden-source-map`都会打包生成单独的`.map`文件，区别在于`source-map`会在打包出来的 js 文件中增加一个引用注释，以便于开发工具在哪里可以找到他，`hidden-source-map`则不会添加这个引用注释，其实从名字就可以看出来

在项目部署于 CDN 时，一般不会将`.map`文件上传，因为会直接映射到源码，而是希望将`.map`文件传到错误解析系统，然后根据上报的错误信息，直接解析到出错的源码位置。

## 处理 CSS 文件

`webpack`不能直接处理 CSS 文件，需要借助与 CSS 相关 loader 的来处理，常用的有`style-loader`、`css-loader`，考虑到兼容性问题，还需要使用`postcss-loader`。如果项目用了 CSS 预处理语言，比如`less`或`sass`或`stylus`，那么就需要相应的 loader--`less-loader`、`sass-loader`、`stylus-loader`。在这里，配置`less`的使用，首先安装相关依赖，`npm install -D less autoprefixer postcss-loader less-loader css-loader style-loader`。接着修改`webpack`配置文件

```js
//  webpack.config.js
module.exports = {
  //  ...
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: [
          //  style-loader，动态创建style标签，将css插入到head中
          'style-loader',
          //  负责处理@import语句
          'css-loader',
          //  postcss-loader和autoprefixer，自动生成浏览器兼容性前缀
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return {
                  require('autoprefixer').({
                    'overrideBrowserslist': [
                      '>0.25%',
                      'not dead'
                    ]
                  })
                }
              }
            }
          },
          //  less-loader，编译处理.less文件，将其转为.css文件
          'less-loader'
        ]
      }
    ]
  }
}
```

## 处理图片/字体文件

在上一步处理后，项目的 webpack 配置已经可以处理`.less`文件了，写个 body 的样式

```css
body {
  background: url('../images/avatar.png');
}
```

运行一下，控制台会提示图片资源 webpack 无法直接处理，同样式文件一样，图片资源也需要相应的 loader。我们常用`url-loader`和`file-loader`。`url-loader`与`file-loader`功能类似，但是前者可以设置指定文件在小于多少资源时，文件经过`file-loader`处理返回`DataURL`。

安装下相关依赖`npm install -D url-loader file-loader`，然后修改 webpack 配置文件

```js
//  webapck.config.js
module.exports = {
  //  ...
  module: {
    rules: [
      {
        tets: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              //  小于文件资源小于10k时，被处理的文件资源以DataURL返回，比如某张小于10k的图，被处理后变成了base64的字符串
              limit: 10240,
              esModule: false
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  }
}
```

以上配置中，limit 的值设为 10240，当文件资源小于 10k 时，会将资源转换为 base64 形式的字符串，超过 10k，将图片拷贝到 dist 目录。`esModule`需要设置为 false，否则`<img src={require('xxx.png')} />`会出现`<img src=[Module Object] />`

将文件资源转换成 base64 可以减少网络请求次数，但是 base64 数据较大，如果项目里太多资源时 base64，会导致加速变慢，所以需要设置一个合适的 limit 值，做到两者兼顾。

默认情况下，经过`url-loader`处理生成的文件名时文件内容的`MD5`哈希值，保留原始资源的拓展名，这可能导致原始资源难以查询。可以通过设置`url-loader`的 options，修改文件的生成名

```js
//  ...
use: [
  {
    loader: 'url-loader'，
    options: {
      limit: 10240,
      esModule: false,
      name: '[name]_[hash:6].[ext]'
    }
  }
]
```

当项目中本地资源较多时，我们会希望它们能够打包在同一个文件夹下，`url-loader`在 options 中指定`output`就可以做到

```js
use: [
  {
    loader: 'url-loader'，
    options: {
      limit: 10240,
      esModule: false,
      name: '[name]_[hash:6].[ext]',
      outpath: 'assets'
    }
  }
]
```

这时候执行`npm run build`，我们就能在构建目录`dist`下发现增加一个`assets`目录，里面都是被处理过的图片资源

## 每次打包前自动清空 dist 目录

多次运行`npm run dev`后，我们会发现`dist`目录下的文件越来越多，着实影响打包文件查看。除了手动清空`dist`目录，我们还可以使用`clean-webpack-plugin`来自动清空

安装依赖`npm install -D clean-webpack-plugin`

然后修改`webpack`配置文件

```js
//  webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  //  ...
  plugins: [
    //  不需要额外参数，会自动获取output的配置，然后取清空
    new CleanWebpackPlugin()
  ]
}
```

这样每次运行`npm run dev`时，都先会把`dist`目录下上次打包出来的文件清空，这样每次打完包后，`dist`目录下都是当前命令生成的新文件。

不过有时候，我们也会希望`dist`下面某些文件能做保留，比如某些可复用的、不需要多次打包的模块，最典型的就是`DLL`。

所谓的 DLL 就是把事先常用但有构建时间长的代码提前打包好（react、react-dom、vue 等），取名叫做 DLL。

那么`dist`目录下相关的`dll`，肯定是不希望直接被删除的，那么可以给`clean-webpack-plugin`加参数

```js
//  webpack.config.js
module.exports = {
  //  ...
  plugins: [
    new CleanWebpackPlugin({
      //  不删除dll目录及其下面的文件
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**']
    })
  ]
}
```

## 总结

通过以上步骤，在实践中完成了一个 webpack 基础配置，了解了 webpack 的四个核心--入口(entry)、出口(output)、处理器(loader)、插件(plugin)，并通过一些处理器和插件的具体使用，整理了一些项目开发中常用的配置。
