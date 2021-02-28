const promiseModuleExecutorFactory = require('./promiseModuleExecutorFactory')

/**
 * Get a module using dynamic imports.
 *
 * @param {string} modulePath
 *     The file system path indicating where the module file is located.
 * @param {Object} [options]
 *     An object containing all options used by this function, promise
 *     executors, and the onFulfilled and onRejected callback functions.
 * @param {boolean} [options.isJson=false]
 *     Explicitly declare the module being requested as JSON. The module will be
 *     treated as though it had the ".json" extension. This is an escape hatch
 *     for JSON files that don't have the ".json" extension. For example, some
 *     ".*rc" files.
 * @param {function} [options.promiseImplementation=Promise]
 *     The promise implementation to use. Defaults to the global `Promise`
 *     implementation.
 * @param {string} [options.relativeToDir=process.cwd()]
 *     Resolve relative `modulePath` values against this directory. The
 *     resulting path will be the result of
 *     `path.resolve(options.relativeToDir, modulePath)`. If `modulePath` is a
 *     relative path and this option is not provided then it rejects with a
 *     TypeError, or if it is a string that is not an absolute path, then a it
 *     rejects with a SyntaxError.
 * @returns {Promise}
 *     A promise that will resolve to a to a module object. It can reject with
 *     errors documented by `options.relativeToDir` or any errors encountered by
 *     the `import()` or `require()` functions.
 * @throws
 *     Any issues the Promise implementation may have while creating a promise.
 */
function promiseModule(modulePath, options) {
  const _Promise = options?.promiseImplementation ?? Promise
  const promiseModuleExecutor = promiseModuleExecutorFactory(
    modulePath,
    options
  )
  return new _Promise(promiseModuleExecutor)
}

module.exports = exports = promiseModule
