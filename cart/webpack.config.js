const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const dotenv = require('dotenv');

const remoteEntry = (envKey, fallback) => process.env[envKey] || fallback;

module.exports = (_env, argv) => {
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });
  const publicPath = process.env.PUBLIC_PATH || 'http://localhost:3003/';

  return {
    entry: './src/index.ts',
    mode,
  devServer: {
    port: 3003,
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
      name: 'cart',
      filename: 'remoteEntry.js',
      remotes: {
        products: `products@${remoteEntry('PRODUCTS_REMOTE', 'http://localhost:3002/remoteEntry.js')}`,
        auth: `auth@${remoteEntry('AUTH_REMOTE', 'http://localhost:3005/remoteEntry.js')}`,
      },
      exposes: {
        './Cart': './src/Cart.tsx',
        './features/remembering/hooks/useRememberProgress':
          './src/features/remembering/hooks/useRememberProgress.ts',
        './features/remembering/hooks/useRememberingSync':
          './src/features/remembering/hooks/useRememberingSync.ts',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.12.0' },
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
    modules: ['node_modules', path.resolve(__dirname, 'node_modules')],
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  };
};
