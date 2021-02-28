const path = require('path')
const {
  COFFEE_SCRIPT_AVAILABLE,
  LIVE_SCRIPT_AVAILABLE,
  TYPE_SCRIPT_AVAILABLE
} = require('./constants')

function onPromiseConfigRejectedFactory(options) {
  const _Promise = options?.promiseImplementation ?? Promise
  const filePath = options?.filePath
  // https://github.com/karma-runner/karma/blob/v6.1.1/lib/config.js#L393
  function onPromiseConfigRejected(reason) {
    if (typeof reason === 'object' && reason !== null) {
      const originalMessage = reason.message
      const errorMessageSegments = ['Error in the Karma config file!', filePath]
      const extension = path.extname(filePath)
      if (extension === '.coffee' && !COFFEE_SCRIPT_AVAILABLE) {
        errorMessageSegments.push('You need to install CoffeeScript.')
        errorMessageSegments.push('npm install coffeescript --save-dev')
      } else if (extension === '.ls' && !LIVE_SCRIPT_AVAILABLE) {
        errorMessageSegments.push('You need to install LiveScript.')
        errorMessageSegments.push('npm install LiveScript --save-dev')
      } else if (extension === '.ts' && !TYPE_SCRIPT_AVAILABLE) {
        errorMessageSegments.push('You need to install TypeScript.')
        errorMessageSegments.push('npm install typescript ts-node --save-dev')
      }
      errorMessageSegments.push(originalMessage)
      if (typeof filePath === 'string') {
        reason.configFilePath = filePath
      }
      reason.message = errorMessageSegments.join('\n  ')
      if (typeof reason.stack === 'string') {
        reason.stack = reason.stack.replace(originalMessage, reason.message)
      }
    }
    return _Promise.reject(reason)
  }
  return onPromiseConfigRejected
}

module.exports = onPromiseConfigRejectedFactory
