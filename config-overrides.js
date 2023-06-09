const { ProvidePlugin } = require("webpack");

module.exports = function (config, env) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(m?js|ts)$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
      ],
    },
    plugins: [
      ...config.plugins,
      new ProvidePlugin({
        process: "process/browser",
      }),
      new ProvidePlugin({
        process: "process",
      }),
      new ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
    resolve: {
      ...config.resolve,
      extensions: [...config.resolve.extensions, ".json"],
      alias: {
        ...config.resolve.alias,
        "@ledgerhq/devices/hid-framing": "@ledgerhq/devices/lib/hid-framing",
      },
      fallback: {
        fs: false,
        child_process: false,
        readline: false,
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        stream: require.resolve("stream-browserify"),
        constants: require.resolve("constants-browserify"),
        crypto: require.resolve("crypto-browserify"),
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        zlib: false,
        http: false,
        https: false,
      },
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};
