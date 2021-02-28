// https://github.com/karma-runner/karma/blob/v6.1.1/lib/cli.js#L126-L135
module.exports = function parseClientArgs(argv) {
  // extract any args after '--' as clientArgs
  let clientArgs = []
  argv = argv.slice(2)
  const idx = argv.indexOf('--')
  if (idx !== -1) {
    clientArgs = argv.slice(idx + 1)
  }
  return clientArgs
}
