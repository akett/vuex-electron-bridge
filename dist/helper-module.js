"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (isRenderer, options) => ({
  state: {
    __loaded: !isRenderer,
    __isRenderer: isRenderer
  },
  getters: {
    [options.getterName]: state => state.__loaded
  },
  mutations: {
    [options.moduleName + '__SET_READY']: (state, payload) => {
      state.__loaded = payload;
    }
  }
});

exports.default = _default;