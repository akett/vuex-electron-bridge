import { loadOptions } from "./options"
import { isObject } from "./utils";

export default (options) => {
  const { contextBridge, ipcRenderer } = require("electron")

  options = loadOptions(isObject(options) ? options : { bridgeName: options })

  contextBridge.exposeInMainWorld(options.bridgeName, {
    [options.ipc.connect]: (payload) => ipcRenderer.invoke(options.ipc.connect, payload),
    [options.ipc.notify_main]: (payload) => ipcRenderer.invoke(options.ipc.notify_main, payload),
    [options.ipc.notify_renderers]: (handler) => ipcRenderer.on(options.ipc.notify_renderers, handler),
  })
}
