const path = require("path");
const { DefinePlugin } = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const digitalUtilsShared = require("digital-utils/sharedConfig");
const setupMockApi = require("../../tools/mockApi");

// Constant host/session identifiers — come from env/config, never generated at runtime
const env = {
  SVIVA: process.env.SVIVA ?? "dev-",
  IDNT_OBJECT_PPR: process.env.IDNT_OBJECT_PPR ?? "poc-idnt-object-ppr",
  IPS_PPRID: process.env.IPS_PPRID ?? "poc-host-ips-pprid",
  IDNT_HOST_MAFIL: process.env.IDNT_HOST_MAFIL ?? "poc-idnt-host-mafil",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "",
  MFE_EXAMPLE_URL: process.env.MFE_EXAMPLE_URL ?? "http://localhost:3001",
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
    port: 3000,
    historyApiFallback: true,
    setupMiddlewares: setupMockApi,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      remotes: {
        mfeExample: `mfeExample@${env.MFE_EXAMPLE_URL}/remoteEntry.js`,
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
