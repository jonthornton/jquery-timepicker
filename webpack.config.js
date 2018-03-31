const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: './src/jquery.timepicker.js',
  output: {
    filename: 'jquery.timepicker.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    "jquery": "jQuery"
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new UglifyJSPlugin(),
    new CopyWebpackPlugin([
      {
        from: 'src/static',
        to: './'
      }
    ])
  ],
  devtool: 'eval-source-map',
};
