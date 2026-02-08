const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const dotenv = require('dotenv');

module.exports = (_env, argv) => {
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });
  const publicPath = process.env.PUBLIC_PATH || 'http://localhost:3005/';

  return {
    entry: './src/index.ts',
    mode,
  devServer: {
    port: 3005,
  },
  output: {
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, '../shared')],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              import: false,
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, `.env.${mode}`),
      silent: true,
    }),
    new ModuleFederationPlugin({
      name: 'auth',
      filename: 'remoteEntry.js',
      exposes: {
        './authStore': './src/store/authStore.ts',
        './firebase': './src/firebase/index.ts',
        './energyStore': './src/store/energyStore.ts',
        './rememberingStore': './src/store/rememberingStore.ts',
        './services/orderService': './src/services/orderService.ts',
        './services/emotionService': './src/services/emotionService.ts',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.12.0' },
        zustand: { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['node_modules', path.resolve(__dirname, 'node_modules')],
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  };
};
