const hydrateState = (store, newState, path = [], module = null) => {
  for (const property of Object.keys(newState)) {
    const testPath = [...path, property];
    if (store.hasModule(testPath)) {
      hydrateState(store, newState[property], testPath, store._modules.get(testPath))
    }
    else {
      if (module) {
        module.state[property] = newState[property]
      }
      else {
        store.state[property] = newState[property]
      }
    }
  }
}

export default (isRenderer, store, options) => ({
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
      if (newState) hydrateState(store, newState);

      store.state[options.moduleName].isHydrated = true
    },
  },
})