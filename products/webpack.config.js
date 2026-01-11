const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    port: 3002,
    historyApiFallback: true, // SPA 라우팅을 위해 필요
  },
  output: {
    publicPath: "http://localhost:3002/",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "products",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductList": "./src/ProductList.js",
        "./ProductDetail": "./src/ProductDetail.js",
        "./cartStore": "./src/store/cartStore.js",
        "./orderStore": "./src/store/orderStore.js",
        "./utils/statusStyle": "./src/utils/statusStyle.js",
        "./constants": "./src/constants/index.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
        "react-router-dom": { singleton: true, requiredVersion: "^7.12.0" },
        "@tanstack/react-query": { singleton: true },
        zustand: { singleton: true },
        sonner: { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
