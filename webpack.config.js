/* eslint-env node */

const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')

const BUILD_FOLDER = path.resolve(__dirname, 'build')

module.exports = {
  mode: 'development',
  entry: {
    ex1: "./src/ex1.js",
    ex2: "./src/ex2.js",
    ex3: "./src/ex3.js"
  },
  output: {
    path: BUILD_FOLDER,
    filename: "[name]-bundle.js"
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { context: './src', from: '*.html' }
      ]
    }),
  ],
  module: {
    rules: [
      // https://webpack.js.org/guides/asset-modules/#source-assets
      {
        test: /\.glsl$/,
        type: 'asset/source'
      }
    ]
  },
  devtool: 'source-map'
}
