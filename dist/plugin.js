"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _utils = require("./utils");

var _options = require("./options");

var _vuex4_override = _interopRequireDefault(require("./vuex4_override"));

var _helperModule = _interopRequireDefault(require("./helper-module"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file will be run on both the main process and renderers
 * to provide the shareCommit method to your Vuex Store.
 *
 * Notes:
 * Commits are processed immediately on the caller (for both the main process and renderers).
 * bridge.js will be executed after this file has run, with it's own Vuex override for the main process.
 */
class Plugin {
  constructor(options, store) {
    this.isRenderer = typeof window !== 'undefined';
    this.store = store;
    this.options = (0, _options.loadOptions)(options);
    this.bridge = this.isRenderer ? window[this.options.bridgeName] : null;

    if (this.isRenderer && (!(0, _utils.isObject)(this.bridge) || (0, _utils.isUndefined)(this.bridge[this.options.ipc.connect]))) {
      throw (0, _utils.error)('Unable to access preload methods. Check "bridgeName" or read the docs.');
    }

    this.overrideVuex();
    this.addHelperModule();
  } // Override Vuex.commit with our method and make it available in Vuex.dispatch contexts


  overrideVuex() {
    // Preserve original commit
    this.store.localCommit = this.store.commit; // Override commit() to warn of possibly unintended usage

    this.store.commit = (type, payload, options) => {
      this.store.localCommit(type, payload, options);

      if (this.options.warnAboutCommit) {
        (0, _utils.warn)(`'${type}' used 'commit()' instead of 'shareCommit()'. Please, read the docs before disabling this warning.`);
      }
    }; // Contextualize shareCommit


    const shareCommit = async (type, payload, options) => {
      return this.shareCommit(type, payload, options);
    }; // Provide shareCommit to global Vuex instance and Vuex.dispatch


    new _vuex4_override.default().override(this.store, shareCommit, this.isRenderer);
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
    this.store.registerModule(this.options.moduleName, (0, _helperModule.default)(this.isRenderer, this.options));
  }

  async hydrate() {
    // Don't run on the main process
    if (!this.isRenderer) return; // Announce self to broker and await main state

    const connection = await this.bridge[this.options.ipc.connect](); // Merge and replace renderer state with main state

    if (connection && connection.state) {
      this.store.replaceState((0, _utils.merge)(this.store.state, JSON.parse(connection.state)));
    } // Indicate that server state was received and imported


    if (this.options.allowHelperModule) {
      this.store.localCommit(this.options.moduleName + '__SET_READY', true);
    } // Listen for shared commits


    this.bridge[this.options.ipc.notify_renderers]((event, data) => this.receiveCommit(event, data));
  }

}

var _default = (options = {}) => async store => {
  return await new Plugin(options, store).hydrate();
};

exports.default = _default;