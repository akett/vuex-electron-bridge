"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warn = exports.merge = exports.isUndefined = exports.isString = exports.isPromise = exports.isObject = exports.error = exports.combineMerge = void 0;

var _deepmerge = _interopRequireDefault(require("deepmerge"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var merge = _deepmerge["default"];
exports.merge = merge;

var combineMerge = function combineMerge(target, source, options) {
  var emptyTarget = function emptyTarget(value) {
    return Array.isArray(value) ? [] : {};
  };

  var clone = function clone(value, options) {
    return merge(emptyTarget(value), value, options);
  };

  var destination = target.slice();
  source.forEach(function (e, i) {
    if (typeof destination[i] === "undefined") {
      var cloneRequested = options.clone !== false;
      var shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone ? clone(e, options) : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = merge(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });
  return destination;
};

exports.combineMerge = combineMerge;

var isUndefined = function isUndefined(val) {
  return typeof val === 'undefined';
};

exports.isUndefined = isUndefined;

var isObject = function isObject(obj) {
  return obj !== null && _typeof(obj) === 'object';
};

exports.isObject = isObject;

var isString = function isString(obj) {
  return typeof obj === 'string';
};

exports.isString = isString;

var isPromise = function isPromise(val) {
  return val && typeof val.then === 'function';
};

exports.isPromise = isPromise;

var warn = function warn(message) {
  var _console;

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  (_console = console).log.apply(_console, ['[vuex-electron-bridge]', message].concat(args));
};

exports.warn = warn;

var error = function error(message) {
  return new Error("[vuex-electron-bridge] " + message);
};

exports.error = error;