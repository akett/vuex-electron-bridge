"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extendVuex = _interopRequireDefault(require("./extend-vuex4"));

var _options = require("./options");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file runs on the main process and coordinates
 * mutation sharing between processes and state persistence.
 *
 * NOTE: plugin.js should have already been loaded in the main process Vuex Store by this point.
 */
class Broker {
  constructor(ipcMain) {
    this.ipc = ipcMain;
    this.store = {};
    this.options = {};
    this.connections = [];
    this.storage = null;
    this._persisting = false;
    this.isRenderer = false;
  }

  setup(store, options = {}) {
    this.store = store;
    this.setOptions(options || this.options);
    this.createVuexExtension();
    this.createStorage();
    this.checkStorage();
    this.hydrateFromStorage();
    this.registerListeners();
  }

  teardown() {
    this.removeListeners();
    this.saveState();
    this.connections = [];
  }

  setOptions(options) {
    this.options = (0, _options.loadOptions)(options);
    this.whitelist = this.loadFilter(this.options.whitelist, "whitelist");
    this.blacklist = this.loadFilter(this.options.blacklist, "blacklist");
  } // Extend Vuex with main process shareCommit (broadcastCommit)


  createVuexExtension() {
    const ref = this;

    async function shareCommit(type, payload, options) {
      return ref.broadcastCommit({
        sender: {
          id: null
        }
      }, {
        type,
        payload,
        options
      });
    }

    (0, _extendVuex.default)(ref, shareCommit);
  }

  loadFilter(filter, name) {
    if (!filter) return null;

    if (filter instanceof Array) {
      return this.filterInArray(filter);
    } else if (typeof filter === "function") {
      return filter;
    }

    (0, _utils.error)(`Filter "${name}" should be Array or Function.`);
  }

  filterInArray(list) {
    return mutation => {
      return list.includes(mutation.type);
    };
  }

  createStorage() {
    if (!this.options.persist) return;

    if (this.options.storageProvider === null) {
      try {
        this.options.storageProvider = new (require("electron-store"))(this.options.storageOptions);
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw (0, _utils.error)(e.toString());
        this.options.persist = false;
        (0, _utils.warn)(`Could not load module "electron-store". Is it installed?`, `"options.persist" has been disabled.`);
        return;
      }
    }

    this.storage = this.options.storageProvider;
  }

  checkStorage() {
    if (!this.options.persist) return;

    try {
      this.options.storageTester(this);
    } catch (e) {
      this.options.persist = false;
      (0, _utils.warn)(`Storage Provider is not valid. Please, read the docs.`, `"options.persist" has been disabled.`, `Error: ${e.toString()}`);
    }
  }

  hydrateFromStorage() {
    if (!this.options.persist) return;
    const state = this.getState(); // TODO: add option to reject properties (at least top-level ones) that don't exist on the store

    const newState = (0, _utils.isObject)(state) && Object.keys(state).length > 0 ? state : null;

    if (this.options.allowHelperModule) {
      this.store.localCommit(this.options.moduleName + '_HYDRATE_STATE', newState);
    } else if (newState) {
      this.store.replaceState((0, _utils.merge)(this.store.state, newState, {
        arrayMerge: _utils.combineMerge
      }));
    }
  }

  isFiltered(moduleName) {
    if (this.options.allowHelperModule && moduleName === this.options.moduleName) return true;
    if (this.blacklist && this.blacklist(moduleName)) return true;
    return this.whitelist && !this.whitelist(moduleName);
  }

  filteredState() {
    // used to prevent persisting and hydrating renderers with certain state
    // for now just a simple top-level-only filtering of state
    // maybe allow for nested properties in future.
    return Object.keys(this.store.state).reduce((o, k) => this.isFiltered(k) ? o : (o[k] = this.store.state[k], o), {});
  }

  getState() {
    if (!this.options.persist) return {};
    return this.options.storageGetter(this);
  }

  saveState() {
    if (!this.options.persist) return;
    this.options.storageSetter(this, this.filteredState());
    this._persisting = false;
  }

  queueSave() {
    if (!this.options.persist || this._persisting) return;
    if (!this.options.persistThrottle > 0) return this.saveState();
    this._persisting = true;
    setTimeout(() => this.saveState(), this.options.persistThrottle);
  }

  registerListeners() {
    this.ipc.handle(this.options.ipc.connect, e => this.hydrateRenderer(e));
    this.ipc.handle(this.options.ipc.notify_main, (e, c) => this.broadcastCommit(e, c));
  }

  removeListeners() {
    this.ipc.removeHandler(this.options.ipc.connect);
    this.ipc.removeHandler(this.options.ipc.notify_main);
  }

  hydrateRenderer(event) {
    // save a reference to the renderer (webContents)
    if (!this.connections[event.sender.id]) {
      this.connections[event.sender.id] = event.sender; // delete reference when renderer is destroyed

      event.sender.on('destroyed', () => delete this.connections[event.sender.id]);
    } // return the state object to the renderer for hydration


    return {
      state: JSON.stringify(this.filteredState())
    };
  }

  broadcastCommit(event, {
    type,
    payload,
    options
  }) {
    // run the commit locally
    this.store.localCommit(type, payload, options); // queue save state

    this.queueSave(); // broadcast the commit to renderers (excluding the sender)

    this.connections.forEach(webContents => {
      if (webContents.id === event.sender.id) return;
      webContents.send(this.options.ipc.notify_renderers, {
        type,
        payload,
        options
      });
    });
  }

}

exports.default = Broker;