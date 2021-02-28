/**
 * Create an onFulfilled promise callback that accepts a specific module object
 * export as its fulfillment value. It returns a processed configuration or
 * a promise that will eventually resolve to a processed configuration.
 *
 * @param {Object} [options]
 *     An object containing all options used by promise executors and the
 *     onFulfilled and onRejected callback functions.
 * @param {Object} [options.fnThis=null]
 *     The `this` argument that exported functions will be called with.
 * @param {Array.<*>|Arguments|*} [options.fnArgs=[]]
 *     An array, Arguments object, or value to be used as function arguments
 *     when the module export is a function.
 * @returns {function}
 *     A Promise onFulfilled callback function. It accepts a specific module
 *     object export as its fulfillment value. It returns/resolves itself with a
 *     processed configuration, or another promise that should eventually
 *     resolve to a processed configuration.
 */
function promiseConfigOnFulfilledFactory(options) {
  /**
   * Get a configuration from a module file.
   *
   * Returned values will resolve the consuming promise with that value. Thrown
   * exceptions will reject the consuming promise with the exception as the
   * reason.
   *
   * @param {*} moduleExport
   *     The a specific export taken from a module object resolved by the
   *     consuming promise.
   * @returns {*}
   *     If `moduleExport` was a function, the return value will be the result
   *     of calling it with the this value set to `options.fnThis` and
   *     `options.fnArgs` as its arguments. Otherwise, `moduleExport` will be
   *     returned.
   * @throws
   *     Any exceptions encountered while calling `moduleExport` as a function.
   */
  function onPromiseModuleExportFulfilled(moduleExport) {
    let config = moduleExport
    if (typeof moduleExport === 'function') {
      const fnThis = options?.fnThis ?? null
      const fnArgsOptions = options?.fnArgs
      const fnArgs = Array.isArray(fnArgsOptions)
        ? fnArgsOptions
        : Object.prototype.toString.call(fnArgsOptions) === '[object Arguments]'
        ? Array.from(fnArgsOptions)
        : typeof fnArgsOptions === 'undefined'
        ? []
        : [fnArgsOptions]

      // If this throws, then the promise returned by the `then`function is
      // rejected. No need to try, catch, and reject with a new promise.
      config = moduleExport.apply(fnThis, fnArgs)
    }
    return config
  }
  return onPromiseModuleExportFulfilled
}
module.exports = exports = promiseConfigOnFulfilledFactory
