export default (isRenderer, options) => ({
  state: {
    __loaded: !isRenderer,
    __isRenderer: isRenderer,
  },
  getters: {
    [options.getterName]: (state) => state.__loaded,
  },
  mutations: {
    [options.moduleName + '__SET_READY']: (state, payload) => {
      state.__loaded = payload;
    },
  },
})