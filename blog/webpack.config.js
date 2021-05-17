const path = require('path')

module.exports = {
  entry: {
    app: ['@babel/polyfill', './src/app.js']
  },
  devServer: {
    // watchContentBase: true
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.html?$/,
        loader: 'raw-loader'
      }
    ]
  }
}
