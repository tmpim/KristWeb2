// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
const path = require("path");
const CracoAlias = require("craco-alias");
const CracoLessPlugin = require("@lemmmy/craco-less");
const AntdDayjsWebpackPlugin = require("antd-dayjs-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const WebpackBar = require("webpackbar");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const { DefinePlugin } = require("webpack");

const gitRevisionPlugin = new GitRevisionPlugin({
  // Include the "-dirty" suffix if the local tree has been modified, and
  // include non-annotated tags.
  versionCommand: "describe --always --tags --dirty"
});

module.exports = {
  style: {
    css: {
      loaderOptions: {
        url: false
      }
    }
  },

  babel: {
    plugins: ["lodash"],
  },

  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        baseUrl: "./src",
        tsConfigPath: "./tsconfig.extend.json"
      }
    },
    {
      plugin: CracoLessPlugin,
      options: {
        cssLoaderOptions: {
          url: false
        },

        lessLoaderOptions: {
          webpackImporter: false,
          implementation: require("less"),

          lessOptions: {
            relativeUrls: false,
            javascriptEnabled: true,
            paths: [path.resolve(__dirname, "node_modules")]
          }
        }
      }
    }
  ],

  // I use eslint in vscode - to save my CPU I'd rather just rely on using that
  // to lint instead of the react-scripts watcher.
  // TODO: run this for production builds, and add a separate command for it.
  eslint: {
    enable: false
  },

  webpack: {
    plugins: [
      new WebpackBar({ profile: true }),
      ...(process.env.NODE_ENV === "development" || process.env.FORCE_ANALYZE
        ? [new BundleAnalyzerPlugin({ openAnalyzer: false })]
        : []),
      new AntdDayjsWebpackPlugin(),
      gitRevisionPlugin,
      new DefinePlugin({
        "__GIT_VERSION__": JSON.stringify(gitRevisionPlugin.version()),
        "__GIT_COMMIT_HASH__": JSON.stringify(gitRevisionPlugin.commithash()),
        "__BUILD_TIME__": DefinePlugin.runtimeValue(Date.now)
      })
    ],

    optimization: {
      sideEffects: true
    }
  },
};
