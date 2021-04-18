const path = require("path");
const glob = require("glob");
const nodeExternals = require("webpack-node-externals");
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    app: "./src/app.ts",
    ...glob
      .sync("./src/commands/*.ts")
      .filter((file) => file.match(/(\w+)\.ts$/))
      .reduce((acc, file) => {
        console.log(file);
        acc[file.match(/(\w+)\.ts/)[1]] = file;
        return acc;
      }, {}),
  },
  target: "node",
  devtool: "inline-source-map",
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
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [],
};
