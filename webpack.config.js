const path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: '../src/app/configuracion/configuracion.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  externals: {
  	sqlite3: 'commonjs sqlite3',
    knex: 'commonjs knex'
  }
};