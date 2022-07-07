# Vuex Electron Bridge

Share Vuex mutations across Electron processes using a [ContextBridge](https://www.electronjs.org/docs/latest/api/context-bridge).

## Features

- **Modern Electron** - Works with (or
  without) [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
  and [Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox).
- **Shared Mutations** - Syncs mutations across all processes, including main.
- **Persisted State** - Permanently persist state using your choice of storage.
    - *Defaults to [electron-store](https://github.com/sindresorhus/electron-store), a file store that supports
      [Encryption](https://github.com/sindresorhus/electron-store#encryptionkey)
      and [Migrations](https://github.com/sindresorhus/electron-store#migrations).*
- **Explicit API** - Provides clear indication when sharing occurs.

## Overview

`vuex-electron-bridge` utilizes the Electron [contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
and IPC to enable mutation sharing across all processes of an Electron app.

Two new methods are provided to your Vuex store, `shareCommit()` and `localCommit()`, allowing you to explicitly choose
when a mutation is shared or kept local.

The following diagram visualizes the behavior of `shareCommit()`. Note that shareCommit will call `localCommit()` before
sharing, and the broker ensures that the sharer does not receive a duplicate.

![Diagram](./docs/diagram.png)

## Installation

*Requires Electron 12 or later. Requires
a [preload script](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload). Currently supports Vuex 4.*

`npm install vuex-electron-bridge`

and to persist state (optional)

`npm install electron-store`

## Setup

1. Add the plugin to your Vuex store

```javascript
// [store].js
import Vuex from "vuex"
import VuexBridge from "vuex-electron-bridge"

export default new Vuex.Store({
  plugins: [
    VuexBridge.createPlugin()
  ]
})
```

2. In your main process create the `Bridge` and `mount` your store to it

```javascript
// [electron].js
import { app } from "electron"
import store from "./path/to/your/store"
import VuexBridge from "vuex-electron-bridge"

const bridge = new VuexBridge.Bridge()

app.on('ready', () => {
  bridge.mount(store)
})
```

3. `expose` the bridge in your [preload script](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)

```javascript
// [preload].js
import VuexBridge from "vuex-electron-bridge"

VuexBridge.expose()

// you may need to use require //
require("vuex-electron-bridge").expose()
```

Congratulations, you can now share commits across processes!

## Usage

Simply use the new method `shareCommit()` as you would `commit()`

```javascript
// in your actions
export default {
  mutations: {
    ['SET_RESULT']: (state, payload) => {
      state.result = payload
    }
  }
  actions: {
    ['GET_RESULT']: async (context) => {
      context.shareCommit('SET_RESULT', await someApi.getResult())
    }
  }
}

// in a Vue component
export default {
  methods: {
    getResult() {
      // using the action
      this.$store.dispatch('GET_RESULT')
      // or directly
      this.$store.shareCommit('SET_RESULT', 'awesome')
    }
  }
}

// in the main process
import store from "./path/to/your/store"

// using the action
store.dispatch('GET_RESULT')
// or directly
store.shareCommit('SET_RESULT', 'incredible')
```

### IMPORTANT

- `shareCommit()` works by sending your commit over IPC. This means that any data you pass to it must be serializable
  according to the HTML standard
  [Structured Clone Algorithm.](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
  For example, a complex object (such as a reactive Vue object) will likely require cloning or other types of
  preparation before it can be committed.
- Calls to `commit()` are not shared and will log a warning to notify you that a mutation was not shared. Although the
  warning can be disabled, you should instead use the provided alias method `localCommit()`, which does not generate a
  warning and clearly indicates a mutation will be local.
- Calls to `dispatch()` are not shared. They execute on the process that called them.
- Renderers are initially hydrated with the entire state object from the **main process**.
- Only the main process state can be persisted. Local mutations on renderers will therefore not be persisted.

### Warning

By definition, sharing some mutations are not others leads to a state mismatch between your Vuex stores. If you plan to
do this and know what you're doing, or don't plan to, feel free to skip this section.

Due to the complexities involved with mixing local and shared mutations, it's recommended to exclusively
use `shareCommit()` and save yourself from a potential headache. However, if applied carefully, the flexibility this
technique provides can be an incredibly powerful tool. Being able to share some mutations and not others allows you to
enjoy all the benefits of shared mutations and keep performance in check when working with large or complex apps.

For smaller applications, you should exclusively use `shareCommit()` and don't look back. For larger, more complex apps,
you may see performance benefits from clever usage of `localCommit()`.

---

## API

### Class `Bridge()`

Creates a new instance of the Bridge which will broker mutations from renderers and handle state persistence. The
instance needs to be mounted, either immediately or in `app.on('ready')`.

- `mount( store, <object>[options] )` - Mounts Vuex to the Bridge with your choice of [options](#Options).
- `unmount()` - Destroys the bridge and attempts to persist state.

### Function `expose( <string>bridgeName | <object>[options] )`

Call in your preload script to expose `Bridge()` to your renderers. Accepts a string or [options](#Options) object.

### Function `createPlugin( <object>[options] )`

Returns a plugin to add to your Vuex store with any [options](#Options). The plugin extends the Vuex API with the following
methods:

- `shareCommit(type, payload, options)` - Shares a mutation with other processes.
- `localCommit(type, payload, options)` - Locally commit a mutation. Alias of `commit()`

## Options

`vuex-electron-bridge` is highly configurable, but works out of the box without configuration. If you need to pass a lot of options, consider creating a `options.js` file (or similar) that exports your options object. As there are three places in which options can be passed, this will make your life a bit easier.

### Shared Options

The following must be passed to `Bridge.mount()`, `expose()` and `createPlugin()`, if you decide to alter them. 

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| bridgeName | string | `'__vuex_bridge'` | Name for the contextBridge exposed on a renderer's `window` object and also used to namespace IPC events. Not necessary to change unless running multiple `Bridge()` instances. |

### Plugin Options

Can be passed to `createPlugin( [options] )`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| warnAboutCommit | boolean | `true` | Set to `false` to disable logging a warning when `commit()` is used. |
| moduleName | string | `'__vuex_bridge'` | The name of the module added to your state |
| actionName | string | `'__vuex_bridge_SET_READY'` | The action/mutation name fired when a renderer finishes hydration and is ready for commits. |
| getterName | string | `'vuexBridgeIsReady'` | The getter name for hydration status. True if hydrated, false if awaiting hydration. |

### Bridge Options

Can be passed to `Bridge.mount(store, [options])`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| persist | boolean | `false` | Toggles state persistence. |
| persistThrottle | int (milliseconds) | `500` | Throttles state persistence to the storageProvider. 0 to disable, increase to reduce I/O load.  |
| storageOptions | object | `{ name: 'vuex' }`| Accepts all [electron-store](https://github.com/sindresorhus/electron-store) options |
| storageKey | string | `'state'` | Top-level JSON key name used to persist state when using `electron-store` |
| storageTestKey | string | `'test'` | Top-level JSON key name used to test save/load functionality of `electron-store`. (see option storageTester) |
| storageProvider | Instance | null | Accepts an instance of your own storage provider. storageOptions are ignored when using this option.  |
| storageGetter | Function | See definition in [options.js](./src/options.js) | Loads state using your custom storage provider |
| storageSetter | Function | See definition in [options.js](./src/options.js) | Saves state using your custom storage provider |
| storageTester | Function | See definition in [options.js](./src/options.js) | Tests your storage provider for basic functionality |

## Likely Questions

### What if I use `commit()` instead of `shareCommit()` on accident?

The commit will still execute and mutate the local state of the process on which it was called. `vuex-electron-bridge`
will warn you of this, but ultimately, it won't stop you. If this was intentional, you should use the commit
alias `localCommit()` which does not generate a warning.

### What if I have an action that must only run on the main process?

That behavior is currently beyond the scope of this library, and is therefore left to you. To do this, you will likely
use IPC to call a method on your main process which from there will dispatch your action. If that action
utilizes `shareCommit()`, the resulting data will be automagically passed back to the state of the renderers.

### Isn't it bad for performance for every process to execute the same commit?

Depends on the application. In my testing, it certainly appears more performant than other solutions which play
ping-pong with a giant state object between multiple processes. Ultimately, this answer will depend on your own testing
under your own requirements.
