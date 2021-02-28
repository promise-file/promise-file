function isPackagePath(modulePath) {
  return (
    typeof modulePath === 'string' &&
    !modulePath.startsWith('.') && // covers "./" and "../"
    !modulePath.startsWith('/') && // relative to system root directory
    !modulePath.startsWith('~') // covers "~/", relative to home directory
  )
}

module.exports = exports = isPackagePath
