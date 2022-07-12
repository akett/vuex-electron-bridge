import createBridge from "./bridge"
import exposeBridge from "./preload"
import createPlugin from "./plugin"
import options from "./options"

const VuexElectronBridge = { createBridge, exposeBridge, createPlugin, options }

export {
  VuexElectronBridge as default,
  createBridge,
  exposeBridge,
  createPlugin,
  options,
}
