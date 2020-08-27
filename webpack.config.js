const path = require('path')
function resolve(filePath) {
  return path.resolve(__dirname, filePath)
}
const isDev = process.env.NODE_ENV === 'development'

const HtmlConfig = require('./public/html.config.js')[isDev ? 'dev' : 'build']
const HtmlWebpackPlugin = require('html-webpack-plugin')

//  使用插件clean-webpack-plugin自动清除每次新打包时上次打包产生的dist文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    index: resolve('src/index.js')
  },
  output: {
    path: resolve('dist'),
    /**
     * publicPath通常是CDN地址配置
     * 比如你编译出来的项目代码部署在CDN上，资源地址是https://my.cdn.com/myproject
     * 那么生产环境下这个publicPath就可配置为https://my.cdn.com
     */
    publicPath: '/',
    //  考虑到cdn缓存的问题，一般打包的文件，需要使用hash值作为输出文件的文件名，以便用户访问时能获取最新资源
    filename: 'bundle.[hash:6].js'
  },
  module: {
    rules: [
      {
        /**
         * 这个loader允许html模板，使用本地的图片，即使在打包后的index.html中，可以使用相对路径引用图片资源
         */
        // test: /\.html$/,
        // use: 'html-withimg-loader'
      },
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        include: /src/
        /**
         * 如若需要在weback.config.js中配置babel
         * 那么只需要新添options属性，参考如下
         * options: {
         *  presets: ["@babel/preset-env"],
         *  plugins: [
         *    "@babel/plugin-transform-runtime",
         *    {
         *      "corejs": 3
         *    }
         *  ]
         * }
         */
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('autoprefixer')({
                    overrideBrowserList: ['>0.25%', 'not dead']
                  })
                ]
              }
            }
          },
          'less-loader'
        ],
        include: /src/
      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2|jfif)$/,
        use: [
          {
            loader: 'url-loader',
            /**
             * 将图片资源转换为base64可以减少网路请求次数，但是base64数据较大，如果太多的资源是 base64，会导致加载变慢
             * 所以需要设置limit值，需要二者兼顾
             */
            options: {
              /**
               * 如果某个图小于10k时，这个图片文件会被url-loader转换为base64字符串，通过image.src='data:'这样直接显示，不需要走网络请求
               * 如果某个图片大于10k，那么这个图片就会被url-loader处理后打包输出到dist/asstes，可自定义输出图片文件名，这个使用引用图片就需要走网络请求
               */
              limit: 10240,
              //  esModule设为false，否则<img src={require('xxx.jpg')}/> 会出现<img src=[Module Object]/>
              esModule: false,
              //  自定义打包后的图片命名
              name: '[name]_[hash:6].[ext]',
              //  如果图片资源比较多，那么指定outputPath: 'assets'，那么url-loader会在dist下创建assets目录
              outputPath: 'assets'
            }
          }
        ],
        include: /src/
      }
    ]
  },
  //  plugins: Array，存放着webpack打包过程所用的plugin及其配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      config: HtmlConfig.template
    }),
    new CleanWebpackPlugin({})
  ],
  //  webpack-dev-server配置
  devServer: {
    //  本地代理服务器端口
    port: '3001',
    //  默认为false，如果为true，除了初始启动信息会输出到控制台，其他任何来自webpack的错误或警告在控制台将不可见
    quiet: false,
    //  默认为true，如果为false，开启iframe模式
    inline: true,
    //  终端仅打印出error，当启用eslint或者使用ts开发时，通过该属性屏蔽控制台的编译信息
    stats: 'errors-only',
    //  编译出错时，是否全屏输出错误
    overlay: false,
    //  输出日志等级
    clientLogLevel: 'silent',
    //  是否启用gzip压缩
    compress: true
  },
  //  开发环境下，devtool常常设置为cheap-module-eval-source-map
  devtool: 'cheap-module-eval-source-map'
}
