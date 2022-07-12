"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _options = require("./options");

var _utils = require("./utils");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function _default(options) {
  var _contextBridge$expose;

  var _require = require("electron"),
      contextBridge = _require.contextBridge,
      ipcRenderer = _require.ipcRenderer;

  options = (0, _options.loadOptions)((0, _utils.isObject)(options) ? options : {
    bridgeName: options
  });
  contextBridge.exposeInMainWorld(options.bridgeName, (_contextBridge$expose = {}, _defineProperty(_contextBridge$expose, options.ipc.connect, function (payload) {
    return ipcRenderer.invoke(options.ipc.connect, payload);
  }), _defineProperty(_contextBridge$expose, options.ipc.notify_main, function (payload) {
    return ipcRenderer.invoke(options.ipc.notify_main, payload);
  }), _defineProperty(_contextBridge$expose, options.ipc.notify_renderers, function (handler) {
    return ipcRenderer.on(options.ipc.notify_renderers, handler);
  }), _contextBridge$expose));
};

exports["default"] = _default;