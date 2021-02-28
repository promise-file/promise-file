const promiseModule = require('./promiseModule')
const promiseNamedExportOnFulfilledFactory = require('./promiseNamedExportOnFulfilledFactory')

/**
 * Get a named export of a module using dynamic imports.
 *
 * @param {string} modulePath
 *     The file system path indicating where the module file is located. Files
 *     with the ".json" extension will use a require function, to avoid the need
 *     to run Node with experimental features enabled.
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
 * @param {function} [options.promiseImplementation=Promise]
 *     The promise implementation to use. Defaults to the global `Promise`
 *     implementation.
 * @param {string} [options.relativeToDir=process.cwd()]
 *     Resolve relative `modulePath` values against this directory. The
 *     resulting path will be the result of
 *     `path.resolve(options.relativeToDir, modulePath)`.
 * @returns {Promise}
 *     A promise that will resolve to a to a specific export of a module. The
 *     default module export is resolved if `options.exportName` is not
 *     provided.
 * @throws
 *     Any issues the Promise implementation may have while creating a promise.
 */
function promiseModuleNamedExport(modulePath, options) {
  const onPromiseModuleFulfilled = promiseNamedExportOnFulfilledFactory(
    modulePath,
    options
  )
  return promiseModule(modulePath, options).then(onPromiseModuleFulfilled)
}

module.exports = exports = promiseModuleNamedExport
