const promiseNamedExport = require('@promise-file/module/namedExport')
const promiseConfigOnFulfilledFactory = require('./promiseConfigOnFulfilledFactory')

// Configurations can take multiple forms, often this is an object or a
// function. The function may return a configuration object or a promise that
// resolves to one.
//
// This function returns a promise that automatically calls the function so that
// the resolved value is a result that is ready to be consumed.
//
// You should not use this module if an exported function is desirable. Try
// using `promiseModuleDefault` or `promiseModule` instead.

/**
 * Get a configuration from a module file using dynamic imports. Process it if
 * needed.
 *
 * @param {string} modulePath
 *     The file system path indicating where the module file is located. Files
 *     with the ".json" extension will use a require function, to avoid the need
 *     to run Node with experimental features enabled.
 * @param {Object} [options]
 *     An object containing all options used by promise executors and the
 *     onFulfilled and onRejected callback functions.
 * @param {string} [options.exportName="default"]
 *     The name of the module's export that you would like to retrive and
 *     process as the configuration. Applies to script modules only, JSON
 *     modules will be returned in their entirety.
 * @param {Object} [options.fnThis=null]
 *     The `this` argument that exported functions will be called with.
 * @param {Array.<*>|Arguments|*} [options.fnArgs=[]]
 *     An array, Arguments object, or value to be used as function arguments
 *     when the module export is a function.
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
 *     A promise that will resolve to a to a processed configuration, or another
 *     promise that should eventually resolve to a processed configuration.
 * @throws
 *     Any issues the Promise implementation may have while creating a promise.
 */
function promiseConfig(modulePath, options) {
  const onPromiseModuleExportFulfilled = promiseConfigOnFulfilledFactory(
    options
  )
  return promiseNamedExport(modulePath, options).then(
    onPromiseModuleExportFulfilled
  )
}

module.exports = exports = promiseConfig
