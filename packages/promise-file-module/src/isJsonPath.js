function isJsonPath(modulePath) {
  // TODO: evaluate the use Regular Expressions
  return typeof modulePath === 'string' && modulePath.endsWith('.json')
}

module.exports = exports = isJsonPath
