const nodeModule = require('module')
const path = require('path')
const isJsonPath = require('./isJsonPath')
const isPackagePath = require('./isPackagePath')

//
// As of January 23, 2021, `import()` in Node.js has experimental support for
// importing JSON and WASM files.
//
// To avoid the need for running node with the `--experimental-json-modules`,
// we will use the suggested work around for manually creating a `require()`
// function using the `module` builtin module, which is not the same as `module`
// property that is available in CommonJS modules.
//

// At some point this file may be converted to an ES module, but it may still
// need access to a require function.
// -   use `__filename` for CommonJS
// -   use `import.meta.url` for ESM
const requireModule = nodeModule.createRequire(__filename)

/**
 * Create a Promise executor function that can be used to retrieve a module
 * using dynamic imports. Files with the ".json" extension will use a require
 * function, to avoid the need to run Node with experimental features enabled.
 *
 * In Node.js, the dynamic imports function (`imports()`) supports both
 * ECMAScript modules and CommonJS modules without the need for transformation,
 * such as by Babel.
 *
 * @param {string} modulePath
 *     The file system path indicating where the module file is located.
 * @param {Object} [options]
 *     An object containing all options used by promise executors and the
 *     onFulfilled and onRejected callback functions.
 * @param {boolean} [options.isJson=false]
 *     Explicitly declare the module being requested as JSON. The module will be
 *     treated as though it had the ".json" extension. This is an escape hatch
 *     for JSON files that don't have the ".json" extension. For example, some
 *     ".*rc" files.
 * @param {string} [options.relativeToDir=process.cwd()]
 *     Resolve relative `modulePath` values against this directory. The
 *     resulting path will be the result of
 *     `path.resolve(options.relativeToDir, modulePath)`. If `modulePath` is a
 *     relative path and this option is not provided then it rejects with a
 *     TypeError, or if it is a string that is not an absolute path, then a it
 *     rejects with a SyntaxError.
 * @returns {function}
 *     A Promise executor function. It will resolve to a module object. It can
 *     reject with errors documented by `options.relativeToDir` or any errors
 *     encountered by the `import()` or `require()` functions.
 */
function promiseModuleExecutorFactory(modulePath, options) {
  // NOTE / REMINDER
  // > The executor has no meaningful return value. It communicates via the
  // > side-effect caused by its resolution function (resolve) or its
  // > rejection function (reject). The side-effect is that the Promise object
  // > becomes "resolved."
  // >
  // > ...
  // >
  // > The returned value can be another promise object, in which case the
  // > promise gets dynamically inserted into the chain.
  //
  // Returning a promise DOES NOT settle the promise that called the executor.

  /**
   * A Promise executor function that can be used to retrieve a module using
   * dynamic imports. Files with the ".json" extension will use a require
   * function, to avoid the need to run Node with experimental features enabled.
   *
   * In Node.js, the dynamic imports function (`imports()`) supports both
   * ECMAScript modules and CommonJS modules without the need for
   * transformation, such as by Babel.
   *
   * @param {function} resolve
   *     A function that accepts one argument ("value"). This settles and
   *     fulfills the promise with the passed value.
   * @param {function} reject
   *     A function that accepts one argument ("reason"). This settles and
   *     rejects the promise with the passed reason.
   */
  function promiseModuleExecutor(resolve, reject) {
    const isJson = options?.isJson ?? false
    const relativeToDir = options?.relativeToDir ?? process.cwd()
    let absoluteModulePath
    let retrievedModule

    if (path.isAbsolute(modulePath) || isPackagePath(modulePath)) {
      absoluteModulePath = modulePath
    } else {
      if (typeof relativeToDir !== 'string') {
        const relativeToDirError = new TypeError(
          'options.relativeToDir must be a string.'
        )
        reject(relativeToDirError)
        return
      }
      if (!path.isAbsolute(relativeToDir)) {
        const absolutePathError = new SyntaxError(
          'Unable to resolve an absolute module file path using' +
            ' options.relativeToDir, it is not an absolute file system path.' +
            ' Value received:\n  ' +
            relativeToDir
        )
        reject(absolutePathError)
        return
      }
      const resolvedPath = path.resolve(relativeToDir, modulePath)
      absoluteModulePath = resolvedPath
    }

    // TODO: investigate WASM support
    // TODO: document `options.forceRequire`,
    const moduleIsJson = isJsonPath(modulePath) || isJson === true
    if (moduleIsJson || options?.forceRequire === true) {
      try {
        // Use a manually created require method to avoid needing to run node in
        // experimental mode for easily detectable cases.
        retrievedModule = requireModule(absoluteModulePath)

        // ES modules can not be imported with `require`. But ES like modules
        // (such as TypeScript) _might_ work, provided you have other
        // means/loaders set up to correctly read the file.
        //
        // `@promise-config/module` can not reasonably maintain integration with
        // every possible loader, so `options.forceRequire` is provided as an
        // escape hatch. One solution you may attempt is `@babel/register`.
      } catch (requireException) {
        reject(requireException)
        return
      }
      resolve(retrievedModule)
      return
    }

    // Dynamic imports can import both ES modules and CommonJS modules.
    // Make sure to resolve or reject with out promise implementation instead of
    // the promise provided by `import()`.
    //
    // The default module loader only supports File and HTTP(S) urls. File paths
    // without a protocol is an error.
    import('file:' + absoluteModulePath).then(resolve, reject)
  }
  return promiseModuleExecutor
}

module.exports = exports = promiseModuleExecutorFactory
