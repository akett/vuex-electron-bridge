"use strict";

module.exports = {
  Bridge: require("./bridge.js").default,
  expose: require("./preload.js").default,
  createPlugin: require("./plugin.js").default,
  defaultOptions: require("./options.js").options
};