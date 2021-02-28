const isJsonPath = require('./isJsonPath')

/**
 * Create an onFulfilled promise callback that accepts a module as its value
 * and returns/resolves itstelf with a specifically named export from that
 * module.
 *
 * @param {string} modulePath
 *     The file system path indicating where the module file is located. If the
 *     path has the ".json" extension, then the entire module will be return
 *     instead of checking for named properties.
 * @param {Object} [options]
 *     An object containing all options used by promise executors and the
 *     onFulfilled and onRejected callback functions.
 * @param {string} [options.exportName="default"]
 *     The name of the module's export that you would like to retrive.
 * @param {boolean} [options.isJson=false]
 *     Explicitly declare the module being requested as JSON. The module will be
 *     treated as though it had the ".json" extension. This is an escape hatch
 *     for JSON files that don't have the ".json" extension. For example, some
 *     ".*rc" files.
 * @returns {function}
 *     A Promise onFulfilled callback function. It accepts a module object as
 *     its value and returns/resolves itself with a specifically named export
 *     from that module.
 */
function promiseNamedExportOnFulfilledFactory(modulePath, options) {
  /**
   * A Promise onFulfilled callback function. It accepts a module object as its
   * value and returns a specifically named export from that module.
   *
   * @param {Object} retrievedModule
   *    The module object resolved by a prior promise that used an identical
   *    `modulePath`.
   *
   * @returns {*}
   *     A named export from the module object for the consuming `then()` method
   *     to resolve with.
   */
  function onPromiseModuleFulfilled(retrievedModule) {
    const isJson = options?.isJson ?? false
    const moduleIsJson = isJsonPath(modulePath) || isJson === true
    // Avoid getting only a portion of a JSON module.
    // if our simple check can't catch this, such as with extensionless rc
    // files, then we provide a way for the consumer to explicitly tell us that
    // it is a JSON module.
    if (moduleIsJson) {
      return retrievedModule
    }

    const exportName = options?.exportName ?? 'default'
    if (exportName === 'default') {
      if (typeof retrievedModule?.default !== 'undefined') {
        // The expectation is that `import()` will be used for JavaScript
        // modules and that the result of this will always have a property named
        // "default" regardless of whether it was a CommonJS module or an
        // ECMAScript module.
        return retrievedModule?.default
      }

      // If module promise details are such that CommonJS modules are not
      // assigned to a "default" property on the module object, then this will
      // handle that.
      return retrievedModule
    } else {
      // The entirety of CommonJS modules may be assigned to a property named
      // "default", so we check that if the module object doesn't have a top
      // level property matching the export name.
      return typeof retrievedModule?.[exportName] !== 'undefined'
        ? retrievedModule?.[exportName]
        : retrievedModule?.default?.[exportName]
    }
  }
  return onPromiseModuleFulfilled
}

module.exports = exports = promiseNamedExportOnFulfilledFactory
