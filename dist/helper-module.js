"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function _default(isRenderer, options) {
  var _getters;

  return {
    state: {
      __isHydrated: false,
      __isRenderer: isRenderer
    },
    getters: (_getters = {}, _defineProperty(_getters, options.getterPrefix + 'IsHydrated', function (state) {
      return state.__isHydrated;
    }), _defineProperty(_getters, options.getterPrefix + 'IsRenderer', function (state) {
      return state.__isRenderer;
    }), _getters),
    mutations: _defineProperty({}, options.moduleName + '_SET_IS_HYDRATED', function (state, payload) {
      return state.__isHydrated = payload;
    })
  };
};

exports["default"] = _default;