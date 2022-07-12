"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createBridge", {
  enumerable: true,
  get: function get() {
    return _bridge["default"];
  }
});
Object.defineProperty(exports, "createPlugin", {
  enumerable: true,
  get: function get() {
    return _plugin["default"];
  }
});
exports["default"] = void 0;
Object.defineProperty(exports, "exposeBridge", {
  enumerable: true,
  get: function get() {
    return _preload["default"];
  }
});
Object.defineProperty(exports, "options", {
  enumerable: true,
  get: function get() {
    return _options["default"];
  }
});

var _bridge = _interopRequireDefault(require("./bridge"));

var _preload = _interopRequireDefault(require("./preload"));

var _plugin = _interopRequireDefault(require("./plugin"));

var _options = _interopRequireDefault(require("./options"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var VuexElectronBridge = {
  createBridge: _bridge["default"],
  exposeBridge: _preload["default"],
  createPlugin: _plugin["default"],
  options: _options["default"]
};
exports["default"] = VuexElectronBridge;