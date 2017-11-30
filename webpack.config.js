const webpack = require("webpack")
const path = require("path")

empty = "";

module.exports = {
  context: __dirname + '/app',
  entry: {
    'app': ['./js/app'],
    'sub': ['./js/sub'],
  },
  output: {
    path: __dirname + '/build/js',
    filename: '[name].js',
    jsonpFunction: 'sub'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query:{
          presets: ['react', 'es2015', "stage-3"]
        }
      },
      {
       test: /\.glsl$/,
       loader: 'shader-loader',
      },
      {
        test: /\.css$/,
        use: [ 'to-string-loader', 'css-loader' ]
      }
    ]
  },
  plugins: [
      new webpack.DefinePlugin({
        ROOT_DIR: JSON.stringify(empty),
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'sub',
        chunks: ['app'],
        minChunks: Infinity,
      }),
  ],
  watch: true,
  //three.jsを使うときにexamples以下をimportできるようにする
  resolve: {
    modules: [
      path.resolve(__dirname, "./app/js"),
      "node_modules"
    ],
    alias: {
      'three-extras': path.resolve(__dirname, 'node_modules/three/examples/js/')
    }
  },
  devtool: 'inline-source-map'

};
