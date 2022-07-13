"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadOptions = exports.default = void 0;
const options = {
  // enables/disables persisting state using the storage provider
  persist: false,
  // milliseconds to wait before persisting state; 0 to disable. higher values reduce IO load.
  persistThrottle: 1000,
  // all electron-store options can be passed here
  storageOptions: {
    name: 'vuex'
  },
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
  storageGetter: broker => {
    return broker.storage.get(broker.options.storageKey);
  },
  // should not be overridden unless using a custom storage provider.
  // should persist the state object.
  storageSetter: (broker, rootState = {}) => {
    if (!broker.options.persist) return;
    broker.storage.set(broker.options.storageKey, rootState);
  },
  // should not be overridden unless using a custom storage provider.
  // should perform a one-time functionality test of the storage provider.
  // will be wrapped in a try/catch for you.
  storageTester: broker => {
    broker.storage.set(broker.options.storageTestKey, broker.options.storageTestKey);
    broker.storage.get(broker.options.storageTestKey);
    broker.storage.delete(broker.options.storageTestKey);
  },
  // the following only need to be changed if a naming conflict exists with your application
  // the name of the object exposed by the contextBridge (i.e. window.__vuex_bridge_)
  bridgeName: '__vuex_bridge_',
  // warn about usage of original Vuex.commit(). (Improper usage can cause a state mismatch!)
  warnAboutCommit: true,
  // to disable adding the helper module to your store.
  allowHelperModule: true,
  // the name for the helper module added to your store (i.e. store.state.__vuex_bridge_)
  moduleName: '__vuex_bridge_',
  // prefix for getters provided by helper store (e.g. getters.vuexIsHydrated, getters.vuexIsRenderer)
  getterPrefix: 'vuex'
};
exports.default = options;

const {
  isObject,
  isUndefined,
  isString
} = require("./utils");

const loadOptions = (opts = {}) => {
  // passing options as a non-object results in complete fallback to the default options.
  if (!isObject(opts)) opts = Object.assign({}, options); // validate options, fallback to defaults

  if (isUndefined(opts.warnAboutCommit)) opts.warnAboutCommit = options.warnAboutCommit;
  if (isUndefined(opts.allowHelperModule)) opts.allowHelperModule = options.allowHelperModule;
  if (!isString(opts.bridgeName)) opts.bridgeName = options.bridgeName;
  if (!isString(opts.moduleName)) opts.moduleName = options.moduleName;
  if (!isString(opts.getterPrefix)) opts.getterPrefix = options.getterPrefix;
  if (isUndefined(opts.persist)) opts.persist = options.persist;
  if (isUndefined(opts.persistThrottle)) opts.persistThrottle = options.persistThrottle;
  if (!isObject(opts.storageOptions)) opts.storageOptions = options.storageOptions;
  if (!isString(opts.storageKey)) opts.storageKey = options.storageKey;
  if (!isString(opts.storageTestKey)) opts.storageTestKey = options.storageTestKey;
  if (isUndefined(opts.storageProvider)) opts.storageProvider = options.storageProvider;
  if (isUndefined(opts.storageGetter)) opts.storageGetter = options.storageGetter;
  if (isUndefined(opts.storageSetter)) opts.storageSetter = options.storageSetter;
  if (isUndefined(opts.storageTester)) opts.storageTester = options.storageTester; // enforce storageOptions when using default storage

  if (opts.persist && !opts.storageProvider) {
    if (!isString(opts.storageOptions.name)) opts.storageOptions.name = options.storageOptions.name;
  }

  opts.ipc = {};
  opts.ipc.connect = opts.bridgeName + ':connect';
  opts.ipc.notify_main = opts.bridgeName + ':notify_main';
  opts.ipc.notify_renderers = opts.bridgeName + ':notify_renderers';
  return opts;
};

exports.loadOptions = loadOptions;