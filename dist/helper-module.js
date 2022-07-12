"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function _default(isRenderer, options) {
  return {
    state: {
      __loaded: !isRenderer,
      __isRenderer: isRenderer
    },
    getters: _defineProperty({}, options.getterName, function (state) {
      return state.__loaded;
    }),
    mutations: _defineProperty({}, options.moduleName + '__SET_READY', function (state, payload) {
      state.__loaded = payload;
    })
  };
};

exports["default"] = _default;