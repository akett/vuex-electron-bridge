"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bridge = void 0;
Object.defineProperty(exports, "Broker", {
  enumerable: true,
  get: function get() {
    return _broker["default"];
  }
});
exports["default"] = void 0;

var _broker = _interopRequireDefault(require("./broker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

/**
 * This file runs on the main process and coordinates the commit
 * synchronization between processes and (optional) file storage.
 *
 * NOTE: plugin.js should have already been loaded in the main process Vuex Store by this point.
 */
var Bridge = /*#__PURE__*/function () {
  function Bridge(store) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Bridge);

    this.mounted = false;
    this.mounting = false;
    this.unmounting = false;
    this.broker = new _broker["default"](require("electron").ipcMain);
    if (!store && !options) return;
    if (store) this.broker.setup(store, options);else if (options) this.broker.setOptions(options);
  }

  _createClass(Bridge, [{
    key: "mount",
    value: function mount(store) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (this.mounted || this.mounting) return;
      this.mounting = true;
      this.broker.setup(store, options);
      this.mounted = true;
      this.mounting = false;
    }
  }, {
    key: "unmount",
    value: function unmount() {
      if (!this.mounted || this.unmounting) return;
      this.unmounting = true;
      this.broker.teardown();
      this.mounted = false;
      this.unmounting = false;
    }
  }, {
    key: "isMounted",
    value: function isMounted() {
      return this.mounted;
    }
  }, {
    key: "isMounting",
    value: function isMounting() {
      return this.mounting;
    }
  }, {
    key: "isUnmounted",
    value: function isUnmounted() {
      return !this.mounted;
    }
  }, {
    key: "isUnmounting",
    value: function isUnmounting() {
      return this.unmounting;
    }
  }]);

  return Bridge;
}();

exports.Bridge = Bridge;

var createBridge = function createBridge(store) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  return new Bridge(store, options);
};

exports["default"] = createBridge;