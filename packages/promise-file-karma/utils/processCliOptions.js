const _ = require('lodash')
const yargs = require('yargs')
// const parseClientArgs = require('./parseClientArgs')

const constant = {
  LOG_DISABLE: 'OFF',
  LOG_ERROR: 'ERROR',
  LOG_WARN: 'WARN',
  LOG_INFO: 'INFO',
  LOG_DEBUG: 'DEBUG',
  LOG_LOG: 'LOG'
}

// As of version 6.x, Karma uses Yargs to parse command line arguments into an
// object.
// -   [`yargs.parse([args], [context], [parseCallback])`](https://github.com/yargs/yargs/blob/master/docs/api.md#parseargs-context-parsecallback)

/**
 * return only args that occur before `--`
 *
 * @param {Array.<string>} argv
 * @returns {Array.<string>}
 *
 * @see [karma source]{@link https://github.com/karma-runner/karma/blob/v6.1.1/lib/cli.js#L137-L142}
 */
function argsBeforeDoubleDash(argv) {
  const idx = argv.indexOf('--')

  return idx === -1 ? argv : argv.slice(0, idx)
}

const helper = {
  /**
   * Converts a dashed string into a camelcased string.
   * @param {string} dash
   * @returns {string}
   *
   * @see [karma source]{@link https://github.com/karma-runner/karma/blob/v6.1.1/lib/helper.js#L103-L106}
   */
  dashToCamel: function dashToCamel(dash) {
    const words = dash.split('-')
    return words.shift() + words.map(helper.ucFirst).join('')
  },
  isDefined: (value) => {
    return !_.isUndefined(value)
  },
  isString: _.isString,
  ucFirst: (word) => {
    return word.charAt(0).toUpperCase() + word.substr(1)
  }
}

/**
 * Process command line arguments
 *
 * @see [karma source]{@link https://github.com/karma-runner/karma/blob/v6.1.1/lib/cli.js#L275-L278}
 */
exports.processCliOptions = function processCliOptions(options) {
  const { beforeDoubleDashOnly, configFilePath } = options
  let argvArray = process.argv.slice(2)
  if (beforeDoubleDashOnly !== false) {
    argvArray = argsBeforeDoubleDash(argvArray)
  }
  const argv = yargs.parse(argvArray)

  // If the command line should take priority for `argv.configFile`, then it
  // needs to be done in the consuming code so that the path here will be
  // consistent with what is actually used.
  argv.configFile = configFilePath
  return processArgs(argv, {
    // `cmd` is unavailable to programatic API as we don't yet know which
    // public API method the config will be passed to.
    // cmd: argv._.shift()
  })
}

/**
 * @param {Object} argv
 * @param {Object} options
 */
function processArgs(argv, options) {
  Object.getOwnPropertyNames(argv).forEach(function (name) {
    let argumentValue = argv[name]
    if (name !== '_' && name !== '$0') {
      if (Array.isArray(argumentValue)) {
        argumentValue = argumentValue.pop() // If the same argument is defined multiple times, override.
      }
      options[helper.dashToCamel(name)] = argumentValue
    }
  })

  if (helper.isString(options.autoWatch)) {
    options.autoWatch = options.autoWatch === 'true'
  }

  if (helper.isString(options.colors)) {
    options.colors = options.colors === 'true'
  }

  if (helper.isString(options.failOnEmptyTestSuite)) {
    options.failOnEmptyTestSuite = options.failOnEmptyTestSuite === 'true'
  }

  if (helper.isString(options.failOnFailingTestSuite)) {
    options.failOnFailingTestSuite = options.failOnFailingTestSuite === 'true'
  }

  if (helper.isString(options.formatError)) {
    let required
    try {
      required = require(options.formatError)
    } catch (err) {
      const originalMessage = err.message
      err.message = [
        'Could not require formatError: ' + options.formatError,
        originalMessage
      ].join('\n  ')
      if (typeof err.stack === 'string') {
        err.stack = err.stack.replace(originalMessage, err.message)
      }
      console.error(err) // This isn't a critical failure, no need to throw.
    }
    // support exports.formatError and module.exports = function
    options.formatError = required.formatError || required
    if (!helper.isFunction(options.formatError)) {
      throw new Error(
        `Format error must be a function, got: ${typeof options.formatError}`
      )
    }
  }

  if (helper.isString(options.logLevel)) {
    const logConstant = constant['LOG_' + options.logLevel.toUpperCase()]
    if (helper.isDefined(logConstant)) {
      options.logLevel = logConstant
    } else {
      console.error(
        'Log level must be one of disable, error, warn, info, or debug.'
      )
      process.exit(1)
    }
  } else if (helper.isDefined(options.logLevel)) {
    throw new Error(
      'Log level must be one of disable, error, warn, info, or debug.'
    )
  }

  if (helper.isString(options.singleRun)) {
    options.singleRun = options.singleRun === 'true'
  }

  if (helper.isString(options.browsers)) {
    options.browsers = options.browsers.split(',')
  }

  if (options.reportSlowerThan === false) {
    options.reportSlowerThan = 0
  }

  if (helper.isString(options.reporters)) {
    options.reporters = options.reporters.split(',')
  }

  if (helper.isString(options.removedFiles)) {
    options.removedFiles = options.removedFiles.split(',')
  }

  if (helper.isString(options.addedFiles)) {
    options.addedFiles = options.addedFiles.split(',')
  }

  if (helper.isString(options.changedFiles)) {
    options.changedFiles = options.changedFiles.split(',')
  }

  if (helper.isString(options.refresh)) {
    options.refresh = options.refresh === 'true'
  }

  // Explicitly sets `options.configFile` to null if no path is provided.
  // path resolution is handled before we get to this point, so there is no need
  // to do it again.
  const configFile = argv.configFile
  options.configFile = configFile || null

  // The `cmd` option won't be available, so we will disable it for now.
  // if (options.cmd === 'run') {
  //   options.clientArgs = parseClientArgs(process.argv)
  // }

  return options
}
