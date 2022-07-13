import { isPromise, isObject, warn } from "./utils"

// -------- methods derived from Vuex 4 code -----------
const installModule = (store, rootState, path, module, hot, isRenderer) => {
  const namespace = store._modules.getNamespace(path)

  const local = module.context = makeLocalContext(store, namespace, path, module, isRenderer)

  module.forEachAction((action, key) => {
    const type    = action.root ? key : namespace + key
    const handler = action.handler || action

    registerAction(store, type, handler, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot, isRenderer)
  })
}

const registerAction = (store, type, handler, local) => {
  const entry = store._actions[type] || (store._actions[type] = []);
  entry.forEach((fn, i) => {
    entry[i] = function wrapperActionHandler(payload) {
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
    }
  })
}

const makeLocalContext = (store, namespace, path, module, isRenderer) => {
  const noNamespace = namespace === ''
  const local       = module.context;

  local.dispatch = noNamespace ? store.dispatch : function (_type, _payload, _options) {
    const args = unifyObjectStyle(_type, _payload, _options)

    if (!args.options || !args.options.root) {
      args.type = namespace + args.type
      if ((isRenderer || process.env.NODE_ENV !== 'production') && !store._actions[args.type]) {
        console.log(`[vuex] unknown local action type: ${args.type}, global type: ${args.type}`)
        return
      }
    }

    return store.dispatch(args.type, args.payload)
  }

  local.commit = noNamespace ? store.commit : function (_type, _payload, _options) {
    const args = unifyObjectStyle(_type, _payload, _options)

    if (!args.options || !args.options.root) {
      args.type = namespace + args.type
      if ((isRenderer || process.env.NODE_ENV !== 'production') && !store._mutations[args.type]) {
        console.log(`[vuex] unknown local mutation type: ${args.type}, global type: ${args.type}`)
        return
      }
    }

    store.commit(args.type, args.payload, args.options)
  }

  local.shareCommit = noNamespace ? store.shareCommit : function (_type, _payload, _options) {
    const args = unifyObjectStyle(_type, _payload, _options)

    if (!args.options || !args.options.root) {
      args.type = namespace + args.type
      if ((isRenderer || process.env.NODE_ENV !== 'production') && !store._mutations[args.type]) {
        console.log(`[vuex] unknown local mutation type: ${args.type}, global type: ${args.type}`)
        return
      }
    }

    return store.shareCommit(args.type, args.payload, args.options)
  }

  local.localCommit = noNamespace ? store.localCommit : function (_type, _payload, _options) {
    const args = unifyObjectStyle(_type, _payload, _options)

    if (!args.options || !args.options.root) {
      args.type = namespace + args.type
      if ((isRenderer || process.env.NODE_ENV !== 'production') && !store._mutations[args.type]) {
        console.log(`[vuex] unknown local mutation type: ${args.type}, global type: ${args.type}`)
        return
      }
    }

    store.localCommit(args.type, args.payload, args.options)
  }

  return local
}

const unifyObjectStyle = (type, payload, options) => {
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type    = type.type
  }

  return { type, payload, options }
}

// ref should contain store, options, and isRenderer properties
const extendVuex = (ref, boundShareCommit) => {
  if (!ref.store.localCommit) {
    // Preserve original commit / provide global alias localCommit
    ref.store.localCommit = ref.store.commit

    // Override commit with warning
    function boundCommit(type, payload, options) {
      if (ref.options.warnAboutCommit) {
        warn(`'${type}' used 'commit()' instead of 'shareCommit()'. Please, read the docs before disabling this warning.`)
      }

      return ref.store.localCommit(type, payload, options);
    }

    ref.store.commit = boundCommit
  }

  // Provide shareCommit globally
  ref.store.shareCommit = boundShareCommit

  // Inject shareCommit in dispatch contexts
  installModule(ref.store, ref.store._modules.root.state, [], ref.store._modules.root, undefined, ref.isRenderer)
}

export default extendVuex;