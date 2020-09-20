const path = require("path");
const CracoAlias = require("craco-alias");

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        baseUrl: ".",
        tsConfigPath: "./tsconfig.extend.json"
      }
    }
  ],

  webpack: {
    alias: {
      scss: path.resolve(__dirname, "src/scss/"),
      fontello: path.resolve(__dirname, "src/fontello/")
    }
  },

  // I use eslint in vscode - to save my CPU I'd rather just rely on using that
  // to lint instead of the react-scripts watcher.
  // TODO: run this for production builds, and add a separate command for it.
  eslint: {
    enable: false
  }
};
