"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Plugin = void 0;

var _extendVuex = _interopRequireDefault(require("./extend-vuex4"));

var _helperModule = _interopRequireDefault(require("./helper-module"));

var _options = require("./options");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file will be run on both the main process and renderers
 * to provide the shareCommit method to your Vuex Store.
 *
 * Notes:
 * Commits are processed immediately on the caller (for both the main process and renderers).
 * broker.js should be executed after this file has run, with it's own Vuex override for the main process.
 */
class Plugin {
  constructor(options, store) {
    this.isRenderer = typeof window !== 'undefined';
    this.hasDevtools = this.isRenderer && typeof window.__VUE_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
    this.store = store;
    this.options = (0, _options.loadOptions)(options);
    this.bridge = this.isRenderer ? window[this.options.bridgeName] : null;
    (0, _utils.assert)(!this.isRenderer || (0, _utils.isObject)(this.bridge), 'contextBridge unavailable. Ensure contextIsolation is enabled and verify "bridgeName" (see docs).');
    this.addHelperModule();
    this.createVuexExtension();
    this.connectMainProcess();
  }

  addHelperModule() {
    // helper module for a simple boolean getter indicating hydration status
    // getter can be used to delay logic which relies on current state
    // getter will be false until the renderer is hydrated with the state from the main process
    if (!this.options.allowHelperModule) return;

    if (!this.store.hasModule(this.options.moduleName)) {
      this.store.registerModule(this.options.moduleName, (0, _helperModule.default)(this.isRenderer, this.store, this.options));
    }
  } // Extend Vuex with shareCommit()


  createVuexExtension() {
    if (!this.isRenderer) return;
    const ref = this;

    async function shareCommit(type, payload, options) {
      // Immediately commit to self
      ref.store.localCommit(type, payload, options); // Send commit to main

      try {
        return ref.bridge[ref.options.ipc.notify_main]({
          type,
          payload,
          options
        });
      } catch (e) {
        (0, _utils.error)(`Error in shareCommit(): ${e.toString()}`, {
          type,
          payload,
          options
        });
      }
    }

    (0, _extendVuex.default)(ref, shareCommit);
  }

  connectMainProcess() {
    if (!this.isRenderer) return; // Connect to bridge and hydrate state

    this.bridge[this.options.ipc.connect]().then(this.hydrateState.bind(this));
  }

  hydrateState(connection) {
    // Merge renderer state with main state
    const state = connection && connection.state ? JSON.parse(connection.state) : null; // Replace state using mutation if using helper module, otherwise use replaceState().
    // it appears that replaceState breaks devtools, so the mutation is recommended.

    if (this.options.allowHelperModule) {
      this.store.localCommit(this.options.moduleName + '_HYDRATE_STATE', state);
    } else if (state) {
      this.store.replaceState((0, _utils.merge)(this.store.state, state, {
        arrayMerge: _utils.combineMerge
      }));
    }

    if (this.hasDevtools) (0, _utils.info)('State hydrated');
    this.registerListeners();
  }

  registerListeners() {
    const ref = this;

    function receiveCommit(event, {
      type,
      payload,
      options
    }) {
      return ref.store.localCommit(type, payload, options);
    } // Listen for shared commits


    this.bridge[this.options.ipc.notify_renderers](receiveCommit);
  }

}

exports.Plugin = Plugin;

const createPlugin = (options = {}) => store => new Plugin(options, store);

exports.default = createPlugin;