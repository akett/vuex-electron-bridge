const { isObject, isUndefined, isString } = require("./utils");

const defaults = {
  // enables/disables persisting state using the storage provider
  persist: false,
  // milliseconds to wait before persisting state; 0 to disable. higher values reduce IO load.
  persistThrottle: 1000,
  // all electron-store options can be passed here
  storageOptions: { name: 'vuex' },
  // name of top-level key to save state to in json file.
  storageKey: 'state',
  // name of top-level key to test saving/loading functionality
  storageTestKey: 'test',
  // pass in your own storage provider here
  // a value of null and persist:true will attempt to use "electron-store"
  // storageOptions, storageKey, and storageTestKey are ignored if using your own storage provider
  storageProvider: null,
  // should not be overridden unless using a custom storage provider.
  // should always return an object.
  storageGetter: (bridge) => {
    return bridge.storage.get(bridge.options.storageKey)
  },
  // should not be overridden unless using a custom storage provider.
  // should persist the state object.
  storageSetter: (bridge) => {
    if (!bridge.options.persist) return;

    bridge.storage.set(bridge.options.storageKey, bridge.store.state)
  },
  // should not be overridden unless using a custom storage provider.
  // should perform a one-time functionality test of the storage provider.
  // will be wrapped in a try/catch for you.
  storageTester: (bridge) => {
    bridge.storage.set(bridge.options.storageTestKey, bridge.options.storageTestKey)
    bridge.storage.get(bridge.options.storageTestKey)
    bridge.storage.delete(bridge.options.storageTestKey)
  },
  // the following only need to be changed if a naming conflict exists with your application
  // the name of the object exposed by the contextBridge (i.e. window.__evb_)
  bridgeName: '__vuex_bridge_',
  // warn about usage of original Vuex.commit(). (Improper usage can cause a state mismatch!)
  warnAboutCommit: true,
  // disable adding the helper module to your store.
  allowHelperModule: true,
  // the name for the module that will be added to your state object (i.e. store.state.__evb)
  moduleName: '__vuex_bridge_',
  // the name used for the bridge ready status getter (i.e. store.getters.evBridgeIsReady)
  getterName: 'vuexBridgeIsReady',
};

module.exports = {
  options: defaults,
  loadOptions(options = {}) {
    // passing options as a non-object results in complete fallback to the default options.
    if (!isObject(options)) options = Object.assign({}, defaults);

    // validate options, fallback to defaults
    if (isUndefined(options.warnAboutCommit)) options.warnAboutCommit = defaults.warnAboutCommit
    if (isUndefined(options.allowHelperModule)) options.allowHelperModule = defaults.allowHelperModule
    if (!isString(options.bridgeName)) options.bridgeName = defaults.bridgeName
    if (!isString(options.moduleName)) options.moduleName = defaults.moduleName
    if (!isString(options.getterName)) options.getterName = defaults.getterName
    if (isUndefined(options.persist)) options.persist = defaults.persist
    if (isUndefined(options.persistThrottle)) options.persistThrottle = defaults.persistThrottle
    if (!isObject(options.storageOptions)) options.storageOptions = defaults.storageOptions
    if (!isString(options.storageKey)) options.storageKey = defaults.storageKey;
    if (!isString(options.storageTestKey)) options.storageTestKey = defaults.storageTestKey;
    if (isUndefined(options.storageProvider)) options.storageProvider = defaults.storageProvider
    if (isUndefined(options.storageGetter)) options.storageGetter = defaults.storageGetter
    if (isUndefined(options.storageSetter)) options.storageSetter = defaults.storageSetter
    if (isUndefined(options.storageTester)) options.storageTester = defaults.storageTester

    // enforce storageOptions when using default storage
    if (options.persist && !options.storageProvider) {
      if (!isString(options.storageOptions.name)) options.storageOptions.name = defaults.storageOptions.name;
    }

    options.ipc                  = {};
    options.ipc.connect          = options.bridgeName + ':connect'
    options.ipc.notify_main      = options.bridgeName + ':notify_main'
    options.ipc.notify_renderers = options.bridgeName + ':notify_renderers'

    return options;
  },
}