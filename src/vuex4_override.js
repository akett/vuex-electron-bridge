import { isPromise, isObject } from "./utils"

export default class VuexOverride {
  override(store, shareCommit, isRenderer = false) {
    // Make shareCommit available globally
    store.shareCommit = shareCommit
    // Inject shareCommit in dispatch contexts
    this.installModule(shareCommit, store, store.state, [], store._modules.root, undefined, isRenderer)
  }

  // ------------------------------------------------- vuex override methods -----------
  installModule(shareCommit, store, rootState, path, module, hot, isRenderer) {
    const namespace = store._modules.getNamespace(path)

    const local = module.context = this.makeLocalContext(shareCommit, store, namespace, path, isRenderer)

    module.forEachAction((action, key) => {
      const type    = action.root ? key : namespace + key
      const handler = action.handler || action

      this.registerAction(store, type, handler, local, isRenderer)
    })

    module.forEachChild((child, key) => {
      this.installModule(shareCommit, store, rootState, path.concat(key), child, hot)
    })
  }

  registerAction(store, type, handler, local) {
    store._actions[type] = []
    store._actions[type].push((payload) => {
      let res = handler.call(store, {
        dispatch: local.dispatch,
        commit: local.commit,
        shareCommit: local.shareCommit,
        localCommit: local.localCommit,
        getters: local.getters,
        state: local.state,
        rootGetters: store.getters,
        rootState: store.state,
      }, payload)
      if (!isPromise(res)) {
        res = Promise.resolve(res)
      }
      if (store._devtoolHook) {
        return res.catch(err => {
          store._devtoolHook.emit('vuex:error', err)
          throw err
        })
      }
      else {
        return res
      }
    })
  }

  makeLocalContext(shareCommit, store, namespace, path, isRenderer) {
    const noNamespace = namespace === ''

    const local = {
      dispatch: noNamespace
        ? store.dispatch
        : (_type, _payload, _options) => {
          const args                 = this.unifyObjectStyle(_type, _payload, _options)
          const { payload, options } = args
          let { type }               = args

          if (!options || !options.root) {
            type = namespace + type
            if ((!isRenderer && (process.env.NODE_ENV !== 'production') && !store._actions[type]) ||
                !store._actions[type]) {
              console.log(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
              return
            }
          }

          return store.dispatch(type, payload)
        },

      commit: noNamespace
        ? store.commit
        : (_type, _payload, _options) => {
          const args                 = this.unifyObjectStyle(_type, _payload, _options)
          const { payload, options } = args
          let { type }               = args

          if (!options || !options.root) {
            type = namespace + type
            if ((!isRenderer && (process.env.NODE_ENV !== 'production') && !store._mutations[type]) ||
                !store._mutations[type]) {
              console.log(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
              return
            }
          }

          store.commit(type, payload, options)
        },

      shareCommit: noNamespace
        ? store.shareCommit
        : (_type, _payload, _options) => {
          const args                 = this.unifyObjectStyle(_type, _payload, _options)
          const { payload, options } = args
          let { type }               = args

          if (!options || !options.root) {
            type = namespace + type
            if ((!isRenderer && (process.env.NODE_ENV !== 'production') && !store._mutations[type]) ||
                !store._mutations[type]) {
              console.log(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
              return
            }
          }

          return shareCommit(type, payload, options)
        },

      localCommit: noNamespace
        ? store.localCommit
        : (_type, _payload, _options) => {
          const args                 = this.unifyObjectStyle(_type, _payload, _options)
          const { payload, options } = args
          let { type }               = args

          if (!options || !options.root) {
            type = namespace + type
            if ((!isRenderer && (process.env.NODE_ENV !== 'production') && !store._mutations[type]) ||
                !store._mutations[type]) {
              console.log(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
              return
            }
          }

          store.localCommit(type, payload, options)
        },
    }

    // getters and state object must be gotten lazily
    // because they will be changed by state update
    Object.defineProperties(local, {
      getters: {
        get: noNamespace
          ? () => store.getters
          : () => this.makeLocalGetters(store, namespace, options),
      },
      state: {
        get: () => this.getNestedState(store.state, path),
      },
    })

    return local
  }

  getNestedState(state, path) {
    return path.reduce((state, key) => state[key], state)
  }

  makeLocalGetters(store, namespace) {
    if (!store._makeLocalGettersCache[namespace]) {
      const gettersProxy = {}
      const splitPos     = namespace.length
      Object.keys(store.getters).forEach(type => {
        // skip if the target getter is not match this namespace
        if (type.slice(0, splitPos) !== namespace) return

        // extract local getter type
        const localType = type.slice(splitPos)

        // Add a port to the getters proxy.
        // Define as getter property because
        // we do not want to evaluate the getters in this time.
        Object.defineProperty(gettersProxy, localType, {
          get: () => store.getters[type],
          enumerable: true,
        })
      })
      store._makeLocalGettersCache[namespace] = gettersProxy
    }

    return store._makeLocalGettersCache[namespace]
  }

  unifyObjectStyle(type, payload, options) {
    if (isObject(type) && type.type) {
      options = payload
      payload = type
      type    = type.type
    }

    return { type, payload, options }
  }
}