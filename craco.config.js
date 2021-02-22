const CracoLessPlugin = require("craco-less");
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
    ],
  },
};
