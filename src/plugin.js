import { merge, warn, error, isUndefined, isObject } from "./utils";
import { loadOptions } from "./options";
import VuexOverride from "./vuex4_override";
import helperModule from "./helper-module"

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
    this.store      = store;
    this.options    = loadOptions(options);
    this.bridge     = this.isRenderer ? window[this.options.bridgeName] : null;

    if (this.isRenderer && (!isObject(this.bridge) || isUndefined(this.bridge[this.options.ipc.connect]))) {
      throw error('Unable to access contextBridge methods. Ensure Context Isolation is enabled, or verify "bridgeName" options (see docs).')
    }

    this.overrideVuex();
    this.addHelperModule();
  }

  // Override Vuex.commit with our method and make it available in Vuex.dispatch contexts
  overrideVuex() {
    // Preserve original commit
    this.store.localCommit = this.store.commit

    // Override commit() to warn of possibly unintended usage
    this.store.commit = (type, payload, options) => {
      this.store.localCommit(type, payload, options);
      if (this.options.warnAboutCommit) {
        warn(`'${type}' used 'commit()' instead of 'shareCommit()'. Please, read the docs before disabling this warning.`)
      }
    }

    // Contextualize shareCommit
    const shareCommit = async (type, payload, options) => {
      return this.shareCommit(type, payload, options)
    }

    // Provide shareCommit to global Vuex instance and Vuex.dispatch
    (new VuexOverride()).override(this.store, shareCommit, this.isRenderer);
  }

  /**
   * Shares commits with other processes.
   * Use 'await' to know *roughly* when all other processes have received the commit
   */
  async shareCommit(type, payload, options) {

    // Immediately commit to self
    this.store.localCommit(type, payload, options)

    // Send commit to main
    try {
      return this.bridge[this.options.ipc.notify_main]({ type, payload, options })
    } catch (e) {
      throw error(`Error in shareCommit(): ${e.toString()}`, { type, payload, options })
    }
  }

  // handles commits shared with renderer
  receiveCommit(event, { type, payload, options }) {
    this.store.localCommit(type, payload, options)
  }

  addHelperModule() {
    // helper module for a simple boolean getter indicating hydration status
    // getter can be used to delay logic which relies on current state
    // getter will be false until the renderer is hydrated with the state from the main process
    if (!this.options.allowHelperModule) return;

    this.store.registerModule(this.options.moduleName, helperModule(this.isRenderer, this.options))
  }

  async hydrate() {
    // Don't run on the main process
    if (!this.isRenderer) return;

    // Announce self to broker and await main state
    const connection = await this.bridge[this.options.ipc.connect]()

    // Merge and replace renderer state with main state
    if (connection && connection.state) {
      this.store.replaceState(merge(this.store.state, JSON.parse(connection.state)))
    }

    // Indicate that server state was received and imported
    if (this.options.allowHelperModule) {
      this.store.localCommit(this.options.moduleName + '__SET_READY', true)
    }

    // Listen for shared commits
    this.bridge[this.options.ipc.notify_renderers]((event, data) => this.receiveCommit(event, data))
  }
}

export default (options = {}) => async (store) => {
  const plugin = new Plugin(options, store)
  return await plugin.hydrate();
}