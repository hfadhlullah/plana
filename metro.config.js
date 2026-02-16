const { withNativeWind } = require("nativewind/metro");
const config = require("expo/metro-config").getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "better-sqlite3": require.resolve("./empty-module.js"),
};

config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

module.exports = withNativeWind(config, { input: "./global.css" });
