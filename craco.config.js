const CracoLessPlugin = require("craco-less");

module.exports = {
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
  }
};
