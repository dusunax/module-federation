const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const dotenv = require('dotenv');

const remoteEntry = (envKey, fallback) => process.env[envKey] || fallback;

module.exports = (_env, argv) => {
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });
  const publicPath = process.env.PUBLIC_PATH || 'http://localhost:3002/';

  return {
    entry: './src/index.ts',
    mode,
  devServer: {
    port: 3002,
    historyApiFallback: true, // SPA 라우팅을 위해 필요
  },
  output: {
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
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
              import: false, // PostCSS가 @import를 처리하도록 함
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, 'postcss.config.js'),
              },
            },
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
      name: 'products',
      filename: 'remoteEntry.js',
      remotes: {
        auth: `auth@${remoteEntry('AUTH_REMOTE', 'http://localhost:3005/remoteEntry.js')}`,
      },
      exposes: {
        './ProductList': './src/ProductList.tsx',
        './ProductDetail': './src/ProductDetail.tsx',
        './cartStore': './src/store/cartStore.ts',
        './orderStore': './src/store/orderStore.ts',
        './utils/statusStyle': './src/utils/statusStyle.ts',
        './constants': './src/constants/index.ts',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.12.0' },
        '@tanstack/react-query': { singleton: true },
        zustand: { singleton: true },
        sonner: { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [
      'node_modules',
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
    ],
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  };
};
