const fsPromises = require('fs/promises') // since Node v10.0.0
const path = require('path')

function wrapStatPromise(fsPromisesStat, options) {
  const _Promise = options?.promiseImplementation ?? Promise
  return function promisedFn(statFilePath, statOptions) {
    return new _Promise(function fsPromisesStatExecutor(resolve, reject) {
      fsPromisesStat(statFilePath, statOptions).then(
        function onfulfilled(fsStats) {
          resolve(statFilePath)
        },
        function onrejected(reason) {
          reject({
            filePath: statFilePath,
            reason
          })
        }
      )
    })
  }
}

/**
 * Resolve the configuration's filepath and check to see if the file exists.
 *
 * @param {?string} [configFilePath]
 *     The file system path where the config file is located. If it is not an
 *     absolute path, then karma will resolve it against the current working
 *     directory. If this is not a string, then the promise will attempt to
 *     locate default config files at the location provided to
 *     `options.relativeToDir`.
 * @param {Object} [options]
 * @param {function} [options.promiseImplementation=Promise]
 *     The promise implementation to use. Defaults to the global `Promise`
 *     implementation.
 * @param {string} [options.relativeToDir=process.cwd()]
 *     Resolve relative `configFilePath` values against this directory. The
 *     resulting path will be the result of
 *     `path.resolve(options.relativeToDir, configFilePath)`.
 * @returns {Promise}
 *     A promise that will resolve to a string that is an absolute file system
 *     path pointing to a configuration file. It will attempt to locate default
 *     files with the same logic that Karma uses internally. It will reject with
 *     any reject reasons from `fsPromises.stat`.
 */
function promiseConfigFilePath(configFilePath, options) {
  const _Promise = options?.promiseImplementation ?? Promise
  const relativeToDir = options?.relativeToDir ?? process.cwd()
  const fsPromisesStat = wrapStatPromise(fsPromises.stat, options)

  // Duplicate fallback logic in Karma
  // https://github.com/karma-runner/karma/blob/v6.1.1/lib/cli.js#L100-L115
  if (typeof configFilePath !== 'string') {
    let autoConfigFilePath
    function retryFactory(nextPath) {
      return function onrejected(/* ignoredReason */) {
        autoConfigFilePath = path.resolve(relativeToDir, nextPath)
        return fsPromisesStat(autoConfigFilePath)
      }
    }
    return (
      _Promise
        // Start with a rejection just to keep all fallbacks in the same code
        // path.
        .reject()
        .catch(retryFactory('karma.conf.js'))
        .catch(retryFactory('karma.conf.coffee'))
        .catch(retryFactory('karma.conf.ts'))
        .catch(retryFactory('.config/karma.conf.js'))
        .catch(retryFactory('.config/karma.conf.coffee'))
        .catch(retryFactory('.config/karma.conf.ts'))
        .catch(
          function onDefaultConfigPathsRejected(/* ignoredLastRetryReason */) {
            const errMessage = [
              'Unable to locate a karma configuration file in the following ' +
                'directory:',
              relativeToDir
            ].join('\n  ')
            const err = new Error(errMessage)
            err.code = 'ENOENT' // Error: No Entity

            // rejection reason MUST have the same shape as `wrapStatPromise`
            // rejections.
            return _Promise.reject({ reason: err })
          }
        )
    )
  }

  let absoluteConfigFilePath = configFilePath
  if (!path.isAbsolute(absoluteConfigFilePath)) {
    // Normally, Karma's CLI would only resolve against the the current working
    // directory. By resolving it ourselves, we gain more control.
    // `karma.config.parseConfig` does not resolve paths, so the manual
    // resolution becomes required for behavior consistent with the CLI.
    // SEE: https://github.com/karma-runner/karma/blob/v6.0.1/lib/cli.js#L117
    //
    // Since we need the path outside of `promiseConfig`, we resolve it here
    // instead of relying upon `promiseConfig`'s internals.
    absoluteConfigFilePath = path.resolve(relativeToDir, configFilePath)
  }
  return fsPromisesStat(absoluteConfigFilePath)
}

module.exports = promiseConfigFilePath
