function onConfigFilePathRejectedFactory(options) {
  const _Promise = options?.promiseImplementation ?? Promise
  // https://github.com/karma-runner/karma/blob/v6.1.1/lib/config.js#L393
  function onConfigFilePathRejected(reasonObject) {
    const { filePath, reason } = reasonObject
    if (typeof reason === 'object' && reason !== null) {
      const originalMessage = reason.message
      const errorMessageSegments = [
        'Error with locating the Karma config file!'
      ]
      if (typeof filePath === 'string') {
        errorMessageSegments.push(filePath)
      }
      errorMessageSegments.push(reason.message)
      reason.message = errorMessageSegments.join('\n  ')
      if (typeof reason.stack === 'string') {
        reason.stack = reason.stack.replace(originalMessage, reason.message)
      }
    }
    return _Promise.reject(reason)
  }
  return onConfigFilePathRejected
}
module.exports = onConfigFilePathRejectedFactory
