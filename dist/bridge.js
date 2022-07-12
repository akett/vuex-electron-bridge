"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _options = require("./options");

var _vuex4_override = _interopRequireDefault(require("./vuex4_override"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

/**
 * This file runs on the main process and coordinates the commit
 * synchronization between processes and (optional) file storage.
 *
 * NOTE: plugin.js should have already been loaded in the main process Vuex Store by this point.
 */
var Bridge = /*#__PURE__*/function () {
  function Bridge() {
    _classCallCheck(this, Bridge);

    this.mounted = false;
    this.mounting = false;
    this.unmounting = false;
    this.broker = new Broker(require("electron").ipcMain);
  }

  _createClass(Bridge, [{
    key: "mount",
    value: function mount(store) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (this.mounted || this.mounting) return;
      this.mounting = true;
      this.broker.setup(store, options);
      this.mounted = true;
      this.mounting = false;
    }
  }, {
    key: "unmount",
    value: function unmount() {
      if (!this.mounted || this.unmounting) return;
      this.unmounting = true;
      this.broker.teardown();
      this.mounted = false;
      this.unmounting = false;
    }
  }, {
    key: "isMounted",
    value: function isMounted() {
      return this.mounted;
    }
  }, {
    key: "isMounting",
    value: function isMounting() {
      return this.mounting;
    }
  }, {
    key: "isUnmounted",
    value: function isUnmounted() {
      return !this.mounted;
    }
  }, {
    key: "isUnmounting",
    value: function isUnmounting() {
      return this.unmounting;
    }
  }]);

  return Bridge;
}();

exports["default"] = Bridge;

var Broker = /*#__PURE__*/function () {
  function Broker(ipcMain) {
    _classCallCheck(this, Broker);

    this.ipc = ipcMain;
    this.store = {};
    this.options = {};
    this.connections = [];
    this.storage = null;
    this._persisting = false;
  }

  _createClass(Broker, [{
    key: "setup",
    value: function setup(store) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.store = store;
      this.options = (0, _options.loadOptions)(options);
      this.overrideVuex();
      this.createStorage();
      this.checkStorage();
      this.hydrateFromStorage();
      this.registerListeners();
    }
  }, {
    key: "teardown",
    value: function teardown() {
      this.removeListeners();
      this.saveState();
      this.connections = [];
    }
  }, {
    key: "overrideVuex",
    value: function overrideVuex() {
      var _this = this;

      // Contextualize shareCommit for the main process, using a null sender ID.
      var shareCommit = /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(type, payload, options) {
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", _this.broadcastCommit({
                    sender: {
                      id: null
                    }
                  }, {
                    type: type,
                    payload: payload,
                    options: options
                  }));

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function shareCommit(_x, _x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }(); // Override main process Vuex.dispatch context with new shareCommit


      new _vuex4_override["default"]().override(this.store, shareCommit, false);
    }
  }, {
    key: "loadFilter",
    value: function loadFilter(filter, name) {
      if (!filter) return null;

      if (filter instanceof Array) {
        return this.filterInArray(filter);
      } else if (typeof filter === "function") {
        return filter;
      }

      throw (0, _utils.error)("Filter \"".concat(name, "\" should be Array or Function."));
    }
  }, {
    key: "filterInArray",
    value: function filterInArray(list) {
      return function (mutation) {
        return list.includes(mutation.type);
      };
    }
  }, {
    key: "createStorage",
    value: function createStorage() {
      if (!this.options.persist) return;

      if (this.options.storageProvider === null) {
        try {
          this.options.storageProvider = new (require("electron-store"))(this.options.storageOptions);
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') throw (0, _utils.error)(e.toString());
          this.options.persist = false;
          (0, _utils.warn)("Could not load module \"electron-store\". Is it installed?", "\"options.persist\" has been disabled.");
          return;
        }
      }

      this.storage = this.options.storageProvider;
      this.whitelist = this.loadFilter(this.options.whitelist, "whitelist");
      this.blacklist = this.loadFilter(this.options.blacklist, "blacklist");
    }
  }, {
    key: "checkStorage",
    value: function checkStorage() {
      if (!this.options.persist) return;

      try {
        this.options.storageTester(this);
      } catch (e) {
        this.options.persist = false;
        (0, _utils.warn)("Storage Provider is not valid. Please, read the docs.", "\"options.persist\" has been disabled.", "Error: ".concat(e.toString()));
      }
    }
  }, {
    key: "hydrateFromStorage",
    value: function hydrateFromStorage() {
      if (!this.options.persist) return;
      var state = this.getState();

      if (state) {
        this.store.replaceState((0, _utils.merge)(this.store.state, state, {
          arrayMerge: _utils.combineMerge
        }));
      }
    }
  }, {
    key: "getState",
    value: function getState() {
      if (!this.options.persist) return {};
      return this.options.storageGetter(this);
    }
  }, {
    key: "saveState",
    value: function saveState() {
      if (!this.options.persist) return;
      this.options.storageSetter(this);
      this._persisting = false;
    }
  }, {
    key: "queueSave",
    value: function queueSave() {
      var _this2 = this;

      if (!this.options.persist || this._persisting) return;
      if (!this.options.persistThrottle > 0) return this.saveState();
      this._persisting = true;
      setTimeout(function () {
        return _this2.saveState();
      }, this.options.persistThrottle);
    }
  }, {
    key: "registerListeners",
    value: function registerListeners() {
      var _this3 = this;

      this.ipc.handle(this.options.ipc.connect, function (e) {
        return _this3.hydrateRenderer(e);
      });
      this.ipc.handle(this.options.ipc.notify_main, function (e, c) {
        return _this3.broadcastCommit(e, c);
      });
    }
  }, {
    key: "removeListeners",
    value: function removeListeners() {
      this.ipc.removeHandler(this.options.ipc.connect);
      this.ipc.removeHandler(this.options.ipc.notify_main);
    }
  }, {
    key: "hydrateRenderer",
    value: function hydrateRenderer(event) {
      var _this4 = this;

      // save a reference to the renderer (webContents)
      this.connections[event.sender.id] = event.sender; // delete reference when renderer is destroyed

      event.sender.on('destroyed', function () {
        return delete _this4.connections[event.sender.id];
      }); // pass the entire state object to the renderer for hydration

      return {
        state: JSON.stringify(this.store.state)
      };
    }
  }, {
    key: "broadcastCommit",
    value: function broadcastCommit(event, _ref2) {
      var _this5 = this;

      var type = _ref2.type,
          payload = _ref2.payload,
          options = _ref2.options;
      if (this.blacklist && this.blacklist(type)) return;
      if (this.whitelist && !this.whitelist(type)) return; // run the commit locally

      this.store.localCommit(type, payload, options); // queue save state

      this.queueSave(); // broadcast the commit to renderers (excluding the sender)

      this.connections.forEach(function (webContents) {
        if (webContents.id === event.sender.id) return;
        webContents.send(_this5.options.ipc.notify_renderers, {
          type: type,
          payload: payload,
          options: options
        });
      });
    }
  }]);

  return Broker;
}();