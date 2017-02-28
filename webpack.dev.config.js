var webpack = require('webpack');
var path = require('path');

process.env.NODE_ENV = 'development';

module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: 'source-map',
  // In production, we only want to load the polyfills and the app code.
  entry: [
    require.resolve('./polyfills'),
    path.resolve(__dirname, './src')
  ],
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'twitch-api.js',
    libraryTarget: 'umd',
    library: 'twitch-api',
  },
  module: {
    preLoaders: [
      {
        test: /\.(js)$/,
        loader: 'eslint',
        include: './src'
      }
    ],
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
      },
      {
        test: /\.(json)$/,
        loader: 'json-loader',
      }
    ],
  },
  plugins: [
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: '"development"', PUBLIC_URL: '""' } }),
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    // Try to dedupe duplicated modules, if any:
    new webpack.optimize.DedupePlugin(),
    // Minify the code.
  ],
};