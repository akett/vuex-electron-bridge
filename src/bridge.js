import { loadOptions } from "./options";
import VuexOverride from "./vuex4_override";
import { combineMerge, error, merge, warn } from "./utils";

/**
 * This file runs on the main process and coordinates the commit
 * synchronization between processes and (optional) file storage.
 *
 * NOTE: plugin.js should have already been loaded in the main process Vuex Store by this point.
 */
export default class Bridge {
  constructor() {
    this.mounted    = false;
    this.mounting   = false;
    this.unmounting = false;
    this.broker     = new Broker(require("electron").ipcMain);
  }

  mount(store, options = {}) {
    if (this.mounted || this.mounting) return;
    this.mounting = true;
    this.broker.setup(store, options);
    this.mounted  = true;
    this.mounting = false;
  }

  unmount() {
    if (!this.mounted || this.unmounting) return;
    this.unmounting = true;
    this.broker.teardown();
    this.mounted    = false;
    this.unmounting = false;
  }

  isMounted() {
    return this.mounted
  }

  isMounting() {
    return this.mounting
  }

  isUnmounted() {
    return !this.mounted
  }

  isUnmounting() {
    return this.unmounting
  }
}

class Broker {
  constructor(ipcMain) {
    this.ipc         = ipcMain;
    this.store       = {};
    this.options     = {};
    this.connections = [];
    this.storage     = null;
    this._persisting = false;
  }

  setup(store, options = {}) {
    this.store   = store
    this.options = loadOptions(options)

    this.overrideVuex();
    this.createStorage()
    this.checkStorage()
    this.hydrateFromStorage()
    this.registerListeners()
  }

  teardown() {
    this.removeListeners();
    this.saveState();
    this.connections = [];
  }

  overrideVuex() {
    // Contextualize shareCommit for the main process, using a null sender ID.
    const shareCommit = async (type, payload, options) => {
      return this.broadcastCommit({ sender: { id: null } }, { type, payload, options });
    }

    // Override main process Vuex.dispatch context with new shareCommit
    (new VuexOverride()).override(this.store, shareCommit, false);
  }

  loadFilter(filter, name) {
    if (!filter) return null

    if (filter instanceof Array) {
      return this.filterInArray(filter)
    }
    else if (typeof filter === "function") {
      return filter
    }

    throw error(`Filter "${name}" should be Array or Function.`)
  }

  filterInArray(list) {
    return (mutation) => {
      return list.includes(mutation.type)
    }
  }

  createStorage() {
    if (!this.options.persist) return;

    if (this.options.storageProvider === null) {
      try {
        this.options.storageProvider = new (require("electron-store"))(this.options.storageOptions);
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw error(e.toString());
        this.options.persist = false;
        warn(
          `Could not load module "electron-store". Is it installed?`,
          `"options.persist" has been disabled.`,
        )
        return;
      }
    }

    this.storage   = this.options.storageProvider;
    this.whitelist = this.loadFilter(this.options.whitelist, "whitelist")
    this.blacklist = this.loadFilter(this.options.blacklist, "blacklist")
  }

  checkStorage() {
    if (!this.options.persist) return;

    try {
      this.options.storageTester(this)
    } catch (e) {
      this.options.persist = false;
      warn(`Storage Provider is not valid. Please, read the docs.`,
        `"options.persist" has been disabled.`,
        `Error: ${e.toString()}`,
      )
    }
  }

  hydrateFromStorage() {
    if (!this.options.persist) return;

    const state = this.getState()

    if (state) {
      this.store.replaceState(merge(this.store.state, state, { arrayMerge: combineMerge }))
    }
  }

  getState() {
    if (!this.options.persist) return {};

    return this.options.storageGetter(this);
  }

  saveState() {
    if (!this.options.persist) return;

    this.options.storageSetter(this);

    this._persisting = false
  }

  queueSave() {
    if (!this.options.persist || this._persisting) return;
    if (!this.options.persistThrottle > 0) return this.saveState()

    this._persisting = true
    setTimeout(() => this.saveState(), this.options.persistThrottle)
  }

  registerListeners() {
    this.ipc.handle(this.options.ipc.connect, (e) => this.hydrateRenderer(e))
    this.ipc.handle(this.options.ipc.notify_main, (e, c) => this.broadcastCommit(e, c))
  }

  removeListeners() {
    this.ipc.removeHandler(this.options.ipc.connect);
    this.ipc.removeHandler(this.options.ipc.notify_main);
  }

  hydrateRenderer(event) {
    // save a reference to the renderer (webContents)
    this.connections[event.sender.id] = event.sender

    // delete reference when renderer is destroyed
    event.sender.on('destroyed', () => delete this.connections[event.sender.id])

    // pass the entire state object to the renderer for hydration
    return { state: JSON.stringify(this.store.state) };
  }

  broadcastCommit(event, { type, payload, options }) {
    if (this.blacklist && this.blacklist(type)) return
    if (this.whitelist && !this.whitelist(type)) return

    // run the commit locally
    this.store.localCommit(type, payload, options);

    // queue save state
    this.queueSave();

    // broadcast the commit to renderers (excluding the sender)
    this.connections.forEach((webContents) => {
      if (webContents.id === event.sender.id) return;
      webContents.send(this.options.ipc.notify_renderers, { type, payload, options })
    })
  }
}