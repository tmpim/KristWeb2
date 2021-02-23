// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
const CracoLessPlugin = require("craco-less");
const AntdDayjsWebpackPlugin = require("antd-dayjs-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const WebpackBar = require("webpackbar");

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
      plugin: CracoLessPlugin,
      options: {
        cssLoaderOptions: {
          url: false
        },

        lessLoaderOptions: {
          lessOptions: {
            relativeUrls: false,
            javascriptEnabled: true
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
      new AntdDayjsWebpackPlugin()
    ],

    optimization: {
      sideEffects: true
    }
  },
};
