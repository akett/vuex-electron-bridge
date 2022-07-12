"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("./utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var VuexOverride = /*#__PURE__*/function () {
  function VuexOverride() {
    _classCallCheck(this, VuexOverride);
  }

  _createClass(VuexOverride, [{
    key: "override",
    value: function override(store, shareCommit) {
      var isRenderer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      // Make shareCommit available globally
      store.shareCommit = shareCommit; // Inject shareCommit in dispatch contexts

      this.installModule(shareCommit, store, store.state, [], store._modules.root, undefined, isRenderer);
    } // ------------------------------------------------- vuex override methods -----------

  }, {
    key: "installModule",
    value: function installModule(shareCommit, store, rootState, path, module, hot, isRenderer) {
      var _this = this;

      var namespace = store._modules.getNamespace(path);

      var local = module.context = this.makeLocalContext(shareCommit, store, namespace, path, isRenderer);
      module.forEachAction(function (action, key) {
        var type = action.root ? key : namespace + key;
        var handler = action.handler || action;

        _this.registerAction(store, type, handler, local, isRenderer);
      });
      module.forEachChild(function (child, key) {
        _this.installModule(shareCommit, store, rootState, path.concat(key), child, hot);
      });
    }
  }, {
    key: "registerAction",
    value: function registerAction(store, type, handler, local) {
      store._actions[type] = [];

      store._actions[type].push(function (payload) {
        var res = handler.call(store, {
          dispatch: local.dispatch,
          commit: local.commit,
          shareCommit: local.shareCommit,
          localCommit: local.localCommit,
          getters: local.getters,
          state: local.state,
          rootGetters: store.getters,
          rootState: store.state
        }, payload);

        if (!(0, _utils.isPromise)(res)) {
          res = Promise.resolve(res);
        }

        if (store._devtoolHook) {
          return res["catch"](function (err) {
            store._devtoolHook.emit('vuex:error', err);

            throw err;
          });
        } else {
          return res;
        }
      });
    }
  }, {
    key: "makeLocalContext",
    value: function makeLocalContext(shareCommit, store, namespace, path, isRenderer) {
      var _this2 = this;

      var noNamespace = namespace === '';
      var local = {
        dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
          var args = _this2.unifyObjectStyle(_type, _payload, _options);

          var payload = args.payload,
              options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;

            if (!isRenderer && process.env.NODE_ENV !== 'production' && !store._actions[type] || !store._actions[type]) {
              console.log("[vuex] unknown local action type: ".concat(args.type, ", global type: ").concat(type));
              return;
            }
          }

          return store.dispatch(type, payload);
        },
        commit: noNamespace ? store.commit : function (_type, _payload, _options) {
          var args = _this2.unifyObjectStyle(_type, _payload, _options);

          var payload = args.payload,
              options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;

            if (!isRenderer && process.env.NODE_ENV !== 'production' && !store._mutations[type] || !store._mutations[type]) {
              console.log("[vuex] unknown local mutation type: ".concat(args.type, ", global type: ").concat(type));
              return;
            }
          }

          store.commit(type, payload, options);
        },
        shareCommit: noNamespace ? store.shareCommit : function (_type, _payload, _options) {
          var args = _this2.unifyObjectStyle(_type, _payload, _options);

          var payload = args.payload,
              options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;

            if (!isRenderer && process.env.NODE_ENV !== 'production' && !store._mutations[type] || !store._mutations[type]) {
              console.log("[vuex] unknown local mutation type: ".concat(args.type, ", global type: ").concat(type));
              return;
            }
          }

          return shareCommit(type, payload, options);
        },
        localCommit: noNamespace ? store.localCommit : function (_type, _payload, _options) {
          var args = _this2.unifyObjectStyle(_type, _payload, _options);

          var payload = args.payload,
              options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;

            if (!isRenderer && process.env.NODE_ENV !== 'production' && !store._mutations[type] || !store._mutations[type]) {
              console.log("[vuex] unknown local mutation type: ".concat(args.type, ", global type: ").concat(type));
              return;
            }
          }

          store.localCommit(type, payload, options);
        }
      }; // getters and state object must be gotten lazily
      // because they will be changed by state update

      Object.defineProperties(local, {
        getters: {
          get: noNamespace ? function () {
            return store.getters;
          } : function () {
            return _this2.makeLocalGetters(store, namespace, options);
          }
        },
        state: {
          get: function get() {
            return _this2.getNestedState(store.state, path);
          }
        }
      });
      return local;
    }
  }, {
    key: "getNestedState",
    value: function getNestedState(state, path) {
      return path.reduce(function (state, key) {
        return state[key];
      }, state);
    }
  }, {
    key: "makeLocalGetters",
    value: function makeLocalGetters(store, namespace) {
      if (!store._makeLocalGettersCache[namespace]) {
        var gettersProxy = {};
        var splitPos = namespace.length;
        Object.keys(store.getters).forEach(function (type) {
          // skip if the target getter is not match this namespace
          if (type.slice(0, splitPos) !== namespace) return; // extract local getter type

          var localType = type.slice(splitPos); // Add a port to the getters proxy.
          // Define as getter property because
          // we do not want to evaluate the getters in this time.

          Object.defineProperty(gettersProxy, localType, {
            get: function get() {
              return store.getters[type];
            },
            enumerable: true
          });
        });
        store._makeLocalGettersCache[namespace] = gettersProxy;
      }

      return store._makeLocalGettersCache[namespace];
    }
  }, {
    key: "unifyObjectStyle",
    value: function unifyObjectStyle(type, payload, options) {
      if ((0, _utils.isObject)(type) && type.type) {
        options = payload;
        payload = type;
        type = type.type;
      }

      return {
        type: type,
        payload: payload,
        options: options
      };
    }
  }]);

  return VuexOverride;
}();

exports["default"] = VuexOverride;