const path = require("path");
const nodeExternals = require("webpack-node-externals");
module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/app.ts",
  target: "node",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@/": path.resolve(__dirname, "src"),
      "~/": path.resolve(__dirname, "src"),
    },
  },
  externals: [nodeExternals()],
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [],
};
