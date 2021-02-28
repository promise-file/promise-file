const promiseNamedExport = require('./promiseNamedExport')

/**
 * Get the default export of a module using dynamic imports.
 *
 * @param {string} modulePath
 *     The file system path indicating where the module file is located. Files
 *     with the ".json" extension will use a require function, to avoid the need
 *     to run Node with experimental features enabled.
 * @param {Object} [options]
 *     An object containing all options used by promise executors and the
 *     onFulfilled and onRejected callback functions.
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
 *     A promise that will resolve to a to the default export of a module or the
 *     entire module in the case of CommonJS modules.
 * @throws
 *     Any issues the Promise implementation may have while creating a promise.
 */
function promiseModuleNamedExport(modulePath, options) {
  const _options =
    typeof options === 'object' && options !== null ? options : {}

  // For when you want to garuntee only the default export, set the option
  // explicitly. Relying on the default behavior is not a garuntee.
  _options.exportName = 'default'
  return promiseNamedExport(modulePath, _options)
}

module.exports = exports = promiseModuleNamedExport
