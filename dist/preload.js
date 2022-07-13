"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _options = require("./options");

var _utils = require("./utils");

const exposeBridge = options => {
  const {
    contextBridge,
    ipcRenderer
  } = require("electron");

  options = (0, _options.loadOptions)((0, _utils.isObject)(options) ? options : {
    bridgeName: options
  });
  contextBridge.exposeInMainWorld(options.bridgeName, {
    [options.ipc.connect]: payload => ipcRenderer.invoke(options.ipc.connect, payload),
    [options.ipc.notify_main]: payload => ipcRenderer.invoke(options.ipc.notify_main, payload),
    [options.ipc.notify_renderers]: handler => ipcRenderer.on(options.ipc.notify_renderers, handler)
  });
};

exports.default = exposeBridge;