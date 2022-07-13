"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bridge = void 0;
Object.defineProperty(exports, "Broker", {
  enumerable: true,
  get: function () {
    return _broker.default;
  }
});
exports.default = void 0;

var _broker = _interopRequireDefault(require("./broker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file runs on the main process and coordinates the commit
 * synchronization between processes and (optional) file storage.
 *
 * NOTE: plugin.js should have already been loaded in the main process Vuex Store by this point.
 */
class Bridge {
  constructor(store, options = {}) {
    this.mounted = false;
    this.mounting = false;
    this.unmounting = false;
    this.broker = new _broker.default(require("electron").ipcMain);
    if (!store && !options) return;
    if (store) this.broker.setup(store, options);else if (options) this.broker.setOptions(options);
  }

  mount(store, options = null) {
    if (this.mounted || this.mounting) return;
    this.mounting = true;
    this.broker.setup(store, options);
    this.mounted = true;
    this.mounting = false;
  }

  unmount() {
    if (!this.mounted || this.unmounting) return;
    this.unmounting = true;
    this.broker.teardown();
    this.mounted = false;
    this.unmounting = false;
  }

  isMounted() {
    return this.mounted;
  }

  isMounting() {
    return this.mounting;
  }

  isUnmounted() {
    return !this.mounted;
  }

  isUnmounting() {
    return this.unmounting;
  }

}

exports.Bridge = Bridge;

const createBridge = (store, options = null) => new Bridge(store, options);

exports.default = createBridge;