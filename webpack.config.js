const path = require('path');

module.exports = {
  entry: './src/server.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
  },
  mode: 'production',
};
