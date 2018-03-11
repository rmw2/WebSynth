const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

module.exports = {
  entry: {
    index: './src/index.jsx',
  },
  output: {
    path: path.resolve('docs/'),
    filename: '[name]-[hash].js'
  },
  module: {
    loaders: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader' ]
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react']
        }
      },
    ]
  },
  plugins: [
    new HTMLWebpackPlugin(),
    new WebpackCleanupPlugin(),
  ]
}