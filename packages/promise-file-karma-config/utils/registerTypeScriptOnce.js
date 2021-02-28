const { TYPE_SCRIPT_AVAILABLE } = require('./constants')
let tsRegistered = false

// https://github.com/karma-runner/karma/blob/v6.1.1/lib/config.js#L377-L379
module.exports = function registerTypeScriptOnce() {
  if (tsRegistered !== true && TYPE_SCRIPT_AVAILABLE) {
    require('ts-node').register()
    tsRegistered = true
  }
}
