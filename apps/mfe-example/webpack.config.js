const path = require("path");
const { DefinePlugin } = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const digitalUtilsShared = require("digital-utils/sharedConfig");
const setupMockApi = require("../../tools/mockApi");

const env = {
  MFE_BASE_URL: process.env.MFE_BASE_URL ?? "http://localhost:3001",
  IDNT_OBJECT_PPR: process.env.IDNT_OBJECT_PPR ?? "2001", // numeric id, kept as a string so DefinePlugin inlines a string literal
  IPS_PPRID: process.env.IPS_PPRID ?? "poc-mfe-example-ips-pprid",
};

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: true,
  },
  // "source-map" gives accurate, fully-mapped stacks for cross-package debugging
  devtool: "source-map",
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/, options: { transpileOnly: true } },
      {
        // consume digital-utils' own .js.map so breakpoints land in its .ts source, not in dist/*.js.
        // scoped to that package: running source-map-loader over all of node_modules is slow and noisy
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        include: [path.resolve(__dirname, "../../packages/digital-utils/dist")],
      },
    ],
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
