const path = require('path')

const promiseConfig = require('@promise-file/config')

const onConfigFilePathRejectedFactory = require('./utils/onConfigFilePathRejectedFactory')
const onPromiseConfigRejectedFactory = require('./utils/onPromiseConfigRejectedFactory')
const { processCliOptions } = require('./utils/processCliOptions')
const promiseConfigFilePath = require('./utils/promiseConfigFilePath')
const registerTypeScriptOnce = require('./utils/registerTypeScriptOnce')

/**
 * Attempt to support async configuration files.
 *
 * @param {string} configFilePath
 *     The file system path where the config file is located. If it is not an
 *     absolute path, then karma will resolve it against the current working
 *     directory. This path is passed to `karma.config.parseConfig`
 * @param {Object} karma
 *     The Karma module.
 * @param {Object} [options]
 * @param {function} [options.promiseImplementation=Promise]
 *     The promise implementation to use. Defaults to the global `Promise`
 *     implementation.
 * @param {string} [options.relativeToDir=process.cwd()]
 *     Resolve relative `configFilePath` values against this directory. The
 *     resulting path will be the result of
 *     `path.resolve(options.relativeToDir, configFilePath)`.
 * @returns {Promise}
 *     A promise that will resolve to a Karma `config` object with the same
 *     defaults and constants that Karma uses internally. It will reject with
 *     any exceptions thrown by `karma.config.parseConfig`.
 */
function promiseKarmaConfigAsync(configFilePath, karma, options) {
  const _Promise = options?.promiseImplementation ?? Promise
  const relativeToDir = options?.relativeToDir ?? process.cwd()

  return promiseConfigFilePath(configFilePath, {
    promiseImplementation: _Promise,
    relativeToDir
  }).then(function onfulfilled(absoluteConfigFilePath) {
    let config
    return new _Promise(function promiseKarmaConfigAsyncExecutor(
      resolve,
      reject
    ) {
      config = karma.config.parseConfig(
        null,
        processCliOptions({
          // Currently, we don't have a way of seperating Karma CLI arguments
          // and karma client argument from other CLI arguments. For this
          // reason, it is left completely up to the config file to set client
          // arguments until another solution can be found. We accomplish this
          // by setting `beforeDoubleDashOnly` to `false` and not attempting
          // to parse client arguments.
          // TODO: investigate clientArgs support.
          beforeDoubleDashOnly: false,
          configFilePath: null
        })
      )

      // Modify the initial values identically to what happens in Karma
      // internally. The nulled defaults will be reapplied by Karma when the
      // config is passed to a Karma method.
      // see: https://github.com/karma-runner/karma/blob/v6.0.1/lib/config.js#L383-L396
      config.hostname = null
      config.listenAddress = null

      const promiseConfigOptions = {
        exportName: 'default',
        forceRequire: options?.forceRequire, // TODO: add to JSDoc comments.
        fnArgs: [config],
        fnThis: null,
        promiseImplementation: _Promise,
        relativeToDir: options?.relativeToDir
      }

      const ext = path.extname(absoluteConfigFilePath)
      if (ext === '.ts' || ext === '.coffee' || ext === '.ls') {
        if (ext === '.ts') {
          registerTypeScriptOnce()
        }

        // Node's API for intercepting ES modules is not yet stable. This is
        // part of why modules like `ts-node` and `@babel/register` don't have
        // stable options available (yet).
        //
        // For now, force the use of `require` so that existing techniques can
        // be used.
        promiseConfigOptions.forceRequire = true
      }

      promiseConfig(absoluteConfigFilePath, promiseConfigOptions)
        .then(
          resolve,
          onPromiseConfigRejectedFactory({
            filePath: absoluteConfigFilePath,
            promiseImplementation: _Promise
          })
        )
        .catch(reject)
    }).then(function normalizeConfigOnFulfilled(/* ignoredValue */) {
      // Karma normally operates on the side effect of mutating the passed
      // config object. It ignores return values. For consistency, we will
      // ignore the resolved fulfillment value and instead consume a reference
      // to the config object we provided previously. When the promise is
      // resolved, all mutations to it should be complete.

      // NOTE: We want to account for `basePath` and `exclude` similar to Karma
      //     : internals, which don't go into effect since we don't pass a path
      //     : tos parseConfig().
      //  SEE: https://github.com/karma-runner/karma/blob/v6.0.1/lib/config.js#L120-L121
      config.basePath = path.resolve(
        path.dirname(absoluteConfigFilePath),
        config.basePath
      ) // resolve basePath
      if (!Array.isArray(config.exclude)) {
        config.exclude = []
      }
      config.exclude.push(absoluteConfigFilePath) // always ignore the config file itself
      return config
    })
  }, onConfigFilePathRejectedFactory({ promiseImplementation: _Promise }))
}

module.exports = exports = promiseKarmaConfigAsync
