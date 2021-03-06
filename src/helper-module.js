const hydrateNestedState = (store, newState, path = [], module = null) => {
  for (const property of Object.keys(newState)) {
    if (module) {
      getNestedState(store.state, path)[property] = module.state[property] = newState[property]
    }
    else {
      store.state[property] = newState[property]
    }

    const newPath = [...path, property];
    if (store.hasModule(newPath)) {
      hydrateNestedState(store, newState[property], newPath, store._modules.get(newPath))
    }
  }
}

const getNestedState = (state, path) => {
  return path.reduce((state, key) => state[key], state)
}

const helperModule = (isRenderer, store, options) => ({
  state: {
    isHydrated: false,
    isRenderer: isRenderer,
  },
  getters: {
    [options.getterPrefix + 'IsHydrated']: (state) => state.isHydrated,
    [options.getterPrefix + 'IsRenderer']: (state) => state.isRenderer,
  },
  mutations: {
    [options.moduleName + '_HYDRATE_STATE']: (state, newState) => {
      if (newState) hydrateNestedState(store, newState);

      store.state[options.moduleName].isHydrated = true
    },
  },
})

export {
  hydrateNestedState,
  getNestedState,
  helperModule as default
}