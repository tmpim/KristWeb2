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
  }
};