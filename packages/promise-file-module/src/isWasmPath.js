/**
 * Determine if the path is intended for a Web Assembly module.
 * @param {string} modulePath
 */
function isWasmPath(modulePath) {
  return typeof modulePath === 'string' && modulePath.endsWith('.wasm')
}
module.exports = exports = isWasmPath
