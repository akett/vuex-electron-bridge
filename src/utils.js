import deepmerge from "deepmerge";

export const merge = deepmerge;

export const combineMerge = (target, source, options) => {
  const emptyTarget = (value) => (Array.isArray(value) ? [] : {})
  const clone       = (value, options) => merge(emptyTarget(value), value, options)
  const destination = target.slice()

  source.forEach(function (e, i) {
    if (typeof destination[i] === "undefined") {
      const cloneRequested = options.clone !== false
      const shouldClone    = cloneRequested && options.isMergeableObject(e)
      destination[i]       = shouldClone ? clone(e, options) : e
    }
    else if (options.isMergeableObject(e)) {
      destination[i] = merge(target[i], e, options)
    }
    else if (target.indexOf(e) === -1) {
      destination.push(e)
    }
  })

  return destination
}

export const isUndefined = (val) => {
  return typeof val === 'undefined'
}

export const isObject = (obj) => {
  return obj !== null && typeof obj === 'object'
}

export const isString = (obj) => {
  return typeof obj === 'string'
}

export const isPromise = (val) => {
  return val && typeof val.then === 'function'
}

export const info = (message, ...args) => {
  (console.info || console.log)('[vuexBridge]', message, ...args)
}

export const warn = (message, ...args) => {
  (console.warn || console.log)('[vuexBridge]', message, ...args)
}

export const assert = (condition, msg) => {
  if (!condition) error(msg)
}

export const error = (msg) => {
  throw new Error("[vuexBridge] " + msg)
}

