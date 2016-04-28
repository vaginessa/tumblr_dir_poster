const colors = require(`colors`)

function debug(s) {
  log(`_:::${s}`, null)
}

function error(s) {
  log(`!:::${s}`, colors.red)
}

function log(s, color=colors.cyan) {
  const logString = !!color ? color(s) : s
  console.log(logString)
}

log.debug = debug
log.error = error
module.exports = log
