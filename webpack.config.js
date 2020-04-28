const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: './src/jquery.timepicker.js',
  output: {
    filename: 'jquery.timepicker.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
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
    new CopyWebpackPlugin([
      {
        from: 'src/static',
        to: './'
      }
    ])
  ],
  devtool: 'eval-source-map',
};
