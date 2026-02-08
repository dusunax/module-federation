const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const dotenv = require('dotenv');

const remoteEntry = (envKey, fallback) => process.env[envKey] || fallback;

module.exports = (_env, argv) => {
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });
  const publicPath = process.env.PUBLIC_PATH || 'http://localhost:3000/';

  return {
    entry: './src/index.ts',
    mode,
  devServer: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  output: {
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
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
              esModule: false,
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
      name: 'host',
      remotes: {
        header: `header@${remoteEntry('HEADER_REMOTE', 'http://localhost:3001/remoteEntry.js')}`,
        products: `products@${remoteEntry('PRODUCTS_REMOTE', 'http://localhost:3002/remoteEntry.js')}`,
        cart: `cart@${remoteEntry('CART_REMOTE', 'http://localhost:3003/remoteEntry.js')}`,
        archive: `archive@${remoteEntry('ARCHIVE_REMOTE', 'http://localhost:3004/remoteEntry.js')}`,
        auth: `auth@${remoteEntry('AUTH_REMOTE', 'http://localhost:3005/remoteEntry.js')}`,
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
          strictVersion: false,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^7.12.0',
          strictVersion: false,
        },
        '@tanstack/react-query': {
          singleton: true,
          requiredVersion: '^5.90.16',
          strictVersion: false,
        },
        zustand: {
          singleton: true,
          requiredVersion: '^4.4.0 || ^5.0.9',
          strictVersion: false,
        },
        sonner: {
          singleton: true,
          requiredVersion: '^2.0.7',
          strictVersion: false,
        },
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
