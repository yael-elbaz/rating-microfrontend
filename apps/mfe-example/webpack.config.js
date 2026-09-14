const path = require("path");
const { DefinePlugin } = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const digitalUtilsShared = require("digital-utils/sharedConfig");
const setupMockApi = require("../../tools/mockApi");

const env = {
  MFE_BASE_URL: process.env.MFE_BASE_URL ?? "http://localhost:3001",
  IDNT_OBJECT_PPR: process.env.IDNT_OBJECT_PPR ?? "mfe-example",
  IPS_PPRID: process.env.IPS_PPRID ?? "poc-mfe-example-ips-pprid",
};

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: true,
  },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/, options: { transpileOnly: true } }],
  },
  devServer: {
    port: 3001,
    headers: { "Access-Control-Allow-Origin": "*" },
    setupMiddlewares: setupMockApi,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "mfeExample",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App",
      },
      shared: {
        ...digitalUtilsShared,
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
    new DefinePlugin(
      Object.fromEntries(Object.entries(env).map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]))
    ),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
  ],
};
