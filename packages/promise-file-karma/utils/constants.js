// Identical check to Karma internals
// https://github.com/karma-runner/karma/blob/v6.1.1/lib/config.js#L13-L32
let COFFEE_SCRIPT_AVAILABLE = false
let LIVE_SCRIPT_AVAILABLE = false
let TYPE_SCRIPT_AVAILABLE = false

try {
  require('coffeescript').register()
  COFFEE_SCRIPT_AVAILABLE = true
} catch (e) {}

// LiveScript is required here to enable config files written in LiveScript.
// It's not directly used in this file.
try {
  require('LiveScript')
  LIVE_SCRIPT_AVAILABLE = true
} catch (e) {}

try {
  require('ts-node')
  TYPE_SCRIPT_AVAILABLE = true
} catch (e) {}

module.exports = {
  COFFEE_SCRIPT_AVAILABLE,
  LIVE_SCRIPT_AVAILABLE,
  TYPE_SCRIPT_AVAILABLE
}
