export default (isRenderer, options) => ({
  state: {
    __isHydrated: false,
    __isRenderer: isRenderer,
  },
  getters: {
    [options.getterPrefix + 'IsHydrated']: (state) => state.__isHydrated,
    [options.getterPrefix + 'IsRenderer']: (state) => state.__isRenderer,
  },
  mutations: {
    [options.moduleName + '_SET_IS_HYDRATED']: (state, payload) => state.__isHydrated = payload,
  },
})