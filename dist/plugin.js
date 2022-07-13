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
    this.isRenderer = typeof window !== 'undefined' || typeof process === 'undefined';
    this.store = store;
    this.options = (0, _options.loadOptions)(options);
    this.bridge = this.isRenderer ? window[this.options.bridgeName] : null;

    if (this.isRenderer && (!(0, _utils.isObject)(this.bridge) || (0, _utils.isUndefined)(this.bridge[this.options.ipc.connect]))) {
      throw (0, _utils.error)('contextBridge unavailable. Ensure contextIsolation is enabled and verify "bridgeName" (see docs).');
    }

    this.addHelperModule();
    this.createVuexExtension();
  } // Extend Vuex with shareCommit()


  createVuexExtension() {
    if (!this.isRenderer) return;
    const ref = this;

    async function boundShareCommit(type, payload, options) {
      return ref.shareCommit(type, payload, options);
    }

    (0, _extendVuex.default)(ref, boundShareCommit);
  }
  /**
   * Shares commits with other processes.
   * Use 'await' to know *roughly* when all other processes have received the commit
   */


  async shareCommit(type, payload, options) {
    // Immediately commit to self
    this.store.localCommit(type, payload, options); // Send commit to main

    try {
      return this.bridge[this.options.ipc.notify_main]({
        type,
        payload,
        options
      });
    } catch (e) {
      throw (0, _utils.error)(`Error in shareCommit(): ${e.toString()}`, {
        type,
        payload,
        options
      });
    }
  } // handles commits shared with renderer


  receiveCommit(event, {
    type,
    payload,
    options
  }) {
    this.store.localCommit(type, payload, options);
  }

  addHelperModule() {
    // helper module for a simple boolean getter indicating hydration status
    // getter can be used to delay logic which relies on current state
    // getter will be false until the renderer is hydrated with the state from the main process
    if (!this.options.allowHelperModule) return;

    if (!this.store.hasModule(this.options.moduleName)) {
      this.store.registerModule(this.options.moduleName, (0, _helperModule.default)(this.isRenderer, this.store, this.options));
    }
  }

  async hydrate() {
    // Don't run on the main process
    if (!this.isRenderer) return;
    const hasDevtools = typeof window.__VUE_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined'; // Announce self to broker and await main state

    const connection = await this.bridge[this.options.ipc.connect](); // Merge renderer state with main state

    const state = connection && connection.state ? JSON.parse(connection.state) : null;
    const newState = (0, _utils.isObject)(state) && Object.keys(state).length > 0 ? (0, _utils.merge)(this.store.state, JSON.parse(connection.state), {
      arrayMerge: _utils.combineMerge
    }) : null; // Replace state using mutation if using helper module, otherwise use replaceState().
    // it appears that replaceState breaks devtools, so the mutation is recommended.

    if (this.options.allowHelperModule) {
      this.store.localCommit(this.options.moduleName + '_HYDRATE_STATE', newState);
    } else if (newState) {
      this.store.replaceState(newState);
    }

    if (hasDevtools) console.log('[vuexBridge] Hydrated state.'); // Listen for shared commits

    this.bridge[this.options.ipc.notify_renderers]((event, data) => this.receiveCommit(event, data));
  }

}

exports.Plugin = Plugin;

const createPlugin = (options = {}) => async store => {
  const plugin = new Plugin(options, store);
  return await plugin.hydrate();
};

exports.default = createPlugin;